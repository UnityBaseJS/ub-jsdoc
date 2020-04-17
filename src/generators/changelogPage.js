const FlexSearch = require('flexsearch')

const fs = require('fs')
const env = require('jsdoc/env')
const path = require('path')
const md = require('markdown-it')()
// autocreate anchor from headers #...####
md.use(require('markdown-it-anchor'))
  // for :!: emoji and not only
  .use(require('markdown-it-emoji'))
  // for smaller date and version (use ~text~ in .md)
  .use(require('markdown-it-sub'))
const renderFile = require('../vueRender')
const { idGeneratorFabric } = require('../utils')
const { createItemFileName } = require('../utils')
const { getChangelogPaths, getParsedChangelogs, getParseErrors, groupingChanges, filterLogByDate, renderToMD } = require('ub-changelog-parser')

const outDir = path.normalize(env.opts.destination)
const isEmptyObj = obj => Object.keys(obj).length === 0

const createNavigation = (tree, year, month) => Object.keys(tree)
  .sort((a, b) => b - a)
  .map(y => (
    {
      name: y,
      isCurrent: year === y,
      submenu: Object.keys(tree[y])
        .sort((a, b) => b - a)
        .map(m => (
          {
            name: m.padStart(2, '0'),
            isCurrent: year === y && month === m,
            link: createItemFileName('cl', y + '-' + m)
          })
        )
    })
  )

/// search
const index = new FlexSearch({
  doc: {
    id: 'id',
    field: [
      'name',
      'description'
    ]
  }
})
const getFTSid = idGeneratorFabric('f')
const ftsData = {}
const addToSearch = (cl, link) => {
  const id = getFTSid()
  index.add({
    id: id,
    name: cl.pkgName,
    description: Object.values(cl.versions).map(change => change.map(({ log }) => log.join(' ')).join(' ')).join((' '))
  })
  ftsData[id] = {
    link: `${link}#${cl.pkgName}`,
    parent: cl.pkgName
  }
}

const changelog = () => {
  console.log('changelog')
  const configPath = path.resolve(process.cwd(), 'changelog.config.json')
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  const pathsToChangelogs = getChangelogPaths(config.pathToPackages.include, config.pathToPackages.exclude)
  const parsedChangelogs = getParsedChangelogs(pathsToChangelogs)
  const errors = getParseErrors(parsedChangelogs)
  if (errors !== '') {
    console.error(errors)
    throw new Error('Parse errors')
  }
  const now = new Date()
  const nowYear = now.getFullYear()
  const nowMonth = now.getMonth()
  const changelogDateTree = {}
  for (let year = 2017; year <= nowYear; year++) {
    const monthTree = {}
    const endMonth = year === nowYear ? nowMonth : 11
    for (let month = 0; month <= endMonth; month++) {
      const fromDate = new Date(year, month, 1)
      const toDate = new Date(year, month + 1, 0)
      const monthCl = parsedChangelogs.map(cl => groupingChanges(filterLogByDate(cl, fromDate, toDate)))
        .filter(({ versions }) => !isEmptyObj(versions))
      // prevent empty month pages
      if (monthCl.length !== 0) {
        monthTree[month + 1] = monthCl
      }
    }
    // prevent empty year pages
    if (!isEmptyObj(monthTree)) {
      changelogDateTree[year] = monthTree
    }
  }

  if (!fs.existsSync(path.resolve(outDir, '../changelog'))) {
    fs.mkdirSync(path.resolve(outDir, '../changelog'))
  }
  const renderNavigation = navigation =>
    '# Monthly changes\n' + navigation
      .map(({ name, submenu }) => `#### ${name}\n` + submenu
        .map(({ link, name: mName }) => `* [${mName}](${link})`)
        .join('\n'))
      .join('\n')

  const navigation = createNavigation(changelogDateTree)

  // create index.html
  const indexHtml = md.render(renderNavigation(navigation))
  renderFile(
    {
      navigation,
      html: indexHtml,
      tableOfContent: []
    },
    path.resolve(__dirname, '../../tmpl/vue/gettingStarted.vue'),
    path.resolve(__dirname, '../../tmpl/html/pageTemplate.html'),
    path.resolve(outDir, '../changelog', 'index.html')
  )

  Object.entries(changelogDateTree).forEach(([year, months]) => {
    Object.entries(months).forEach(([month, cls]) => {
      const menu = cls.map(cl => cl.pkgName).map(pkgName => ({ name: pkgName, link: `#${pkgName}` }))
      const tableOfContent = [{ name: 'Packages', props: menu }]
      const html = md.render(renderToMD(cls))
      const fileName = createItemFileName('cl', year + '-' + month)
      renderFile(
        {
          navigation: createNavigation(changelogDateTree, year, month),
          html,
          tableOfContent
        },
        path.resolve(__dirname, '../../tmpl/vue/gettingStarted.vue'),
        path.resolve(__dirname, '../../tmpl/html/pageTemplate.html'),
        path.resolve(outDir, '../changelog', fileName)
      )

      cls.forEach(cl => addToSearch(cl, fileName))
    })
  })

  fs.writeFileSync(path.resolve(outDir, '../changelog', 'ftsIndex.json'), JSON.stringify(index.export()))
  fs.writeFileSync(path.resolve(outDir, '../changelog', 'ftsData.json'), JSON.stringify(ftsData))
}

module.exports = changelog
