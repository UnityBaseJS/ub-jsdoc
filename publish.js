const helper = require('jsdoc/util/templateHelper')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const FlexSearch = require('flexsearch')
const env = require('jsdoc/env')
const Mustache = require('mustache')
const shell = require('shelljs')
const md = require('markdown-it')({ html: true }) // for anchors in md <a name=...>
// autocreate anchor from headers #...####
md.use(require('markdown-it-anchor'), {
  permalink: true,
  permalinkClass: 'header-anchor',
  permalinkSymbol: '#',
  permalinkBefore: false,

  slugify: (s) => encodeURIComponent(String(s).trim().toLowerCase().replace(/,?\s+,?/g, '-')) // change headers with comas
})
md.use(require('markdown-it-table-of-contents'), { includeLevel: [1, 2, 3] })
md.use(require('markdown-it-emoji')) // for :!: emoji and not only
md.use(require('markdown-it-mermaid-plugin'))

const {
  createItemLink,
  createItemFileName,
  itemTypes,
  groupDoclets,
  groupRootDoclets,
  idGeneratorFabric,
  isVerbose
} = require('./src/utils')
const renderFile = require('./src/vueRender')
const filterGroupByMemberOf = (groupedItems = [], memberName) => groupedItems.filter(({ memberof }) => memberof === memberName)

exports.publish = function (taffyData, opts, tutorials) {
  const extendedConfig = env.conf.extendedConfig
  const outdir = path.normalize(env.opts.destination)
  const outSourcePath = path.resolve(outdir, 'source')

  // create html templates from mustache
  fs.readdirSync(path.resolve(__dirname, 'tmpl/html'), { withFileTypes: true })
    .filter(item => !item.isDirectory())
    .map(item => item.name)
    .filter(name => name.endsWith('.mustache'))
    .forEach(name => {
      const file = fs.readFileSync(path.resolve(__dirname, 'tmpl/html', name), 'utf-8')
      const outputPath = path.resolve(__dirname, 'tmpl/html', name.replace('mustache', 'html'))
      fs.writeFileSync(outputPath, Mustache.render(file, env.conf))
    })

  // todo rewrite with fs
  shell.mkdir('-p', outdir, outSourcePath)

  const data = helper.prune(taffyData)
  data.sort('longname, version, since')
  const allData = data().get()

  const { prepareDoclets, replaceAllLinks } = require('./src/parsers')(allData)

  const tutorialReplacer = (__, name) => {
    const link = createItemFileName('tutorial', name)
    const title = getTutorialTitle(name)
    return `<a href="${link}">${title}</a>`
  }

  const preparedDoclets = prepareDoclets(allData)
  const groupedItems = groupDoclets(preparedDoclets)
  const rootGroupedItems = groupRootDoclets(preparedDoclets)

  generateIndexPage()
  generateSourceCode()
  generateDoc()

  if (tutorials.children.length > 0) {
    generateTutorials()
  }
  if (extendedConfig.extends) {
    extendedConfig.extends.forEach(extend => {
      require(extend)(replaceAllLinks)
    })
  }

  function generateIndexPage () {
    const indexNavigation = Object.keys(itemTypes).filter(type => rootGroupedItems[type] && rootGroupedItems[type][0]).map(type => ({
      name: itemTypes[type].name,
      isCurrent: type === 'module',

      // link: createItemLink(type, rootGroupedItems[type][0].name),
      submenu: _.uniqBy(rootGroupedItems[type], 'name').map(item => ({
        name: item.name,
        link: createItemLink(item.kind, item.name)
      }))
    }))

    renderFile(
      {
        readme: replaceAllLinks(env.opts.readme).replace(/{@tutorial (.*?)}/g, tutorialReplacer),
        navigation: indexNavigation,
        contents: []
      },
      path.resolve(__dirname, 'tmpl/vue/index.vue'),
      path.resolve(__dirname, 'tmpl/html/pageTemplate.html'),
      path.resolve(outdir, 'index.html')
    )
  }

  function generateSourceCode () {
    // copyFiles(path.resolve(staticPath, 'styles'), outSourcePath)
    // copyFiles(path.resolve(staticPath, 'scripts'), outSourcePath)

    const files = allData.map(item => item.meta ? {
      path: item.meta.path,
      name: item.meta.filename
    } : undefined).filter(v => v)
    const codeFiles = _.uniqBy(files, file => `${file.path}/${file.name}`)
    codeFiles.forEach(file => {
      const code = fs.readFileSync(`${file.path}/${file.name}`, 'utf-8')

      renderFile(
        { code },
        path.resolve(__dirname, 'tmpl/vue/source.vue'),
        path.resolve(__dirname, 'tmpl/html/source.html'),
        path.resolve(outdir, 'source', createItemFileName('source', `${path.basename(file.path)}/${file.name}`))
      )
    })
  }

  function generateDoc () {
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
    const addToSearch = (item, parent, link) => {
      const id = getFTSid()
      index.add({
        id: id,
        name: item.name,
        description: item.readme ? item.readme.replace(/<.*?>/g, ' ') : undefined || item.classdesc ? item.classdesc.replace(/<.*?>/g, ' ') : undefined || item.description ? item.description.replace(/<.*?>/g, ' ') : undefined || item.content /* for tutorials */
      })
      ftsData[id] = {
        link,
        // path: item.longname,
        kind: item.kind,
        // name: item.name,
        parent: parent || item.name
      }
    }

    const createNavigation = (currentType, currentItem) => {
      return Object.keys(itemTypes).filter(type => rootGroupedItems[type] && rootGroupedItems[type][0]).map(type => ({
        name: itemTypes[type].name,
        // link: createItemLink(type, rootGroupedItems[type][0].name),
        isCurrent: type === currentType,
        // // submenu present only for current type
        // submenu: type === currentType ? _.uniqBy(rootGroupedItems[type], 'name').map(item => ({
        //   name: item.name,
        //   link: createItemLink(item.kind, item.name),
        //   isCurrent: item.name === currentItem
        // })) : undefined

        // submenu for all
        submenu: _.uniqBy(rootGroupedItems[type], 'name').map(item => ({
          name: item.name,
          link: createItemLink(item.kind, item.name),
          isCurrent: item.name === currentItem
        }))
      }))
    }

    const renderType = (type) => {
      const renderItem = (item, parent) => {
        // if (item.name === 'uba_prevPasswordsHash_ns') debugger
        const itemName = itemTypes[item.kind].generateName(item.name, parent ? parent.name : undefined)
        item.breadcrumbs = [...parent ? parent.breadcrumbs : [], {
          name: item.name,
          link: createItemLink(item.kind, item.name)
        }]
        addToSearch(item, parent ? parent.name : undefined, createItemLink(item.kind, item.name))
        const subclasses = groupedItems.class ? filterGroupByMemberOf(groupedItems.class, itemName) : []
        subclasses.forEach(clazz => {
          clazz.link = createItemLink(clazz.kind, clazz.name)
          renderItem(clazz, {
            name: itemName,
            kind: item.kind,
            breadcrumbs: item.breadcrumbs
          })
        })

        const submodules = groupedItems.module ? filterGroupByMemberOf(groupedItems.module, itemName) : []
        submodules.forEach(submodule => {
          submodule.link = createItemLink(submodule.kind, submodule.name)
          renderItem(submodule, {
            name: itemName,
            kind: item.kind,
            breadcrumbs: item.breadcrumbs
          })
        })

        const mixins = groupedItems.module ? filterGroupByMemberOf(groupedItems.mixin, itemName) : []
        mixins.forEach(mixin => {
          mixin.link = createItemLink(mixin.kind, mixin.name)
          renderItem(mixin, {
            name: itemName,
            kind: item.kind,
            breadcrumbs: item.breadcrumbs
          })
        })

        const members = groupedItems.member ? filterGroupByMemberOf(groupedItems.member, itemName) : []

        const funcs = groupedItems.function ? filterGroupByMemberOf(groupedItems.function, itemName) : []

        const types = groupedItems.typedef ? filterGroupByMemberOf(groupedItems.typedef, itemName) : []

        const events = groupedItems.event ? filterGroupByMemberOf(groupedItems.event, itemName) : []

        // replace tutorials link and add it to t-o-content
        const tutorialsTable = { name: 'Tutorials', props: [] }
        const tutorialReplacer = (__, name) => {
          const link = createItemFileName('tutorial', name)
          const title = getTutorialTitle(name)
          // add tutorials to t-o-content
          tutorialsTable.props.push({
            name: title,
            link
          })
          return `<a href="${link}">${title}</a>`
        }

        const replaceTutorialLinks = text => {
          return text.replace(/{@tutorial (.*?)}/g, tutorialReplacer)
        }

        item.readme = item.readme ? replaceTutorialLinks(item.readme) : undefined
        item.description = item.description ? replaceTutorialLinks(item.description) : undefined
        item.classdesc = item.classdesc ? replaceTutorialLinks(item.classdesc) : undefined
        members.forEach(member => {
          member.description = member.description ? replaceTutorialLinks(member.description) : undefined
          addToSearch(member, item.name, createItemLink(item.kind, item.name, member.name))
        })
        funcs.forEach(func => {
          func.description = func.description ? replaceTutorialLinks(func.description) : undefined
          addToSearch(func, item.name, createItemLink(item.kind, item.name, func.name))
        })
        types.forEach(type => {
          type.description = type.description ? replaceTutorialLinks(type.description) : undefined
          addToSearch(type, item.name, createItemLink(item.kind, item.name, type.name))
        })
        events.forEach(event => {
          event.description = event.description ? replaceTutorialLinks(event.description) : undefined
          addToSearch(event, item.name, createItemLink(item.kind, item.name, event.name))
        })

        const tableOfContent = [
          tutorialsTable,
          {
            name: 'Members',
            props: members.map(member => ({
              name: member.name,
              link: `#${member.name}`
            }))
          },
          {
            name: 'Methods',
            props: funcs.map(func => ({
              name: func.name,
              link: `#${func.name}`
            }))
          },
          {
            name: 'Types',
            props: types.map(type => ({
              name: type.name,
              link: `#${type.name}`
            }))
          },
          {
            name: 'Events',
            props: events.map(event => ({
              name: event.name,
              link: `#${event.name}`
            }))
          }
        ]
        if (isVerbose) console.log(`Render ${item.kind} ${item.name} from ${item.meta.filename} using ${item.kind}.vue`)
        renderFile(
          {
            navigation: createNavigation(item.kind, item.name),
            [item.kind === 'class' ? 'clazz' : item.kind]: item,
            subclasses,
            submodules,
            mixins,
            members,
            funcs,
            types,
            events,
            tableOfContent: tableOfContent
          },
          path.resolve(__dirname, `tmpl/vue/${item.kind}.vue`),
          path.resolve(__dirname, 'tmpl/html/pageTemplate.html'),
          path.resolve(outdir, createItemFileName(item.kind, item.name)))
      }
      if (rootGroupedItems[type]) {
        rootGroupedItems[type].forEach(item => renderItem(item))
      }
    }
    renderType('module')
    renderType('class')
    renderType('namespace')
    renderType('mixin')
    renderType('interface')
    // renderFile global
    // const renderGlobal = () => {
    //   debugger
    //   const globalItems = allData.filter(({ scope, kind }) => scope === 'global' && ['member', 'function'].includes(kind))
    //
    // }
    //
    // renderGlobal()

    // serialize search
    fs.writeFileSync(path.resolve(outdir, 'ftsIndex.json'), JSON.stringify(index.export()))
    fs.writeFileSync(path.resolve(outdir, 'ftsData.json'), JSON.stringify(ftsData))
  }

  function generateTutorials () {
    console.log('Rendering tutorials')
    // tutorialNavigation
    const createTutorialNavigation = current => tutorials.children
      .sort(({ title: a }, { title: b }) => a.localeCompare(b))
      .map(tutorial => ({
        name: tutorial.title,
        link: createItemFileName('tutorial', tutorial.name),
        submenu: [{
          name: 'Introduction',
          isCurrent: current === tutorial.name,
          link: createItemFileName('tutorial', tutorial.name)
        }, ...tutorial.children.map(tutor => ({
          name: tutor.title,
          isCurrent: current === tutor.name,
          link: createItemFileName('tutorial', tutor.name)
        }))]
      }))

    // renderFile index
    renderFile(
      { navigation: createTutorialNavigation('') },
      path.resolve(__dirname, 'tmpl/vue/tutorialIndex.vue'),
      path.resolve(__dirname, 'tmpl/html/pageTemplate.html'),
      path.resolve(outdir, 'tutorialIndex.html')
    )

    const imgTutorialFolderSrc = path.resolve(env.opts.template, '../../', env.opts.tutorials, 'img')
    const imgTutorialFolderDist = path.resolve(outdir, 'img')
    shell.mkdir('-p', imgTutorialFolderSrc)
    shell.cp('-rf', imgTutorialFolderSrc, imgTutorialFolderDist)
    // if (!fs.existsSync(path.resolve(outdir, '../tutorials'))) {
    //   fs.mkdirSync(path.resolve(outdir, '../tutorials'))
    // }
    // copyFiles(path.resolve(staticPath, 'styles'), path.resolve(outdir, '../tutorials'))
    // copyFiles(path.resolve(staticPath, 'scripts'), path.resolve(outdir, '../tutorials'))
    const renderTutorial = tutorial => {
      const html = md.render(tutorial.content)
      renderFile(
        {
          navigation: createTutorialNavigation(tutorial.name),
          html
        },
        path.resolve(__dirname, 'tmpl/vue/tutorial.vue'),
        path.resolve(__dirname, 'tmpl/html/pageTemplate.html'),
        path.resolve(outdir, createItemFileName('tutorial', tutorial.name))
      )
      tutorial.children.forEach(renderTutorial)
    }

    tutorials.children.forEach(renderTutorial)
  }

  function getTutorialTitle (name) {
    const allTutorials = [...tutorials.children, ..._.flatten(tutorials.children.map(tutorial => tutorial.children))]
    const tutorial = allTutorials.filter(tutorial => tutorial.name === name)[0]
    if (tutorial === undefined) {
      console.error(`Can't find ${name} tutorial. Please check and rename`)
      return name
    }
    return tutorial.title
  }
}
