const fs = require('fs')
const env = require('jsdoc/env')
const path = require('path')
const shell = require('shelljs')
const md = require('markdown-it')({ html: true }) // for anchors in md <a name=...>
// autocreate anchor from headers #...####
md.use(require('markdown-it-anchor'), {
  permalink: true,
  permalinkClass: 'header-anchor',
  permalinkSymbol: '#',
  permalinkBefore: false,

  slugify: (s) => encodeURIComponent(String(s).trim().toLowerCase().replace(/,?\s+,?/g, '-')) // change headers with comas
}).use(require('markdown-it-emoji')) // for :!: emoji and not only

const renderFile = require('../vueRender')
const { createItemFileName } = require('../utils')

const outdir = path.normalize(env.opts.destination)
const gsPath = path.resolve(outdir, '../../getting-started/samples-master/courses/tutorial-v5/cityPortalTutorials-v5')

// change links from /courses/tutorial-v5/... to relative
const replaceGitLabLinks = page => page.replace(/courses\/tutorial-v5\/cityPortalTutorials-v5\/(.*)\.md/g, (__, filename) => createItemFileName('gs', filename))

const tree = JSON.parse(fs.readFileSync(path.resolve(gsPath, 'tree.json'), 'utf-8'))
const createGSNavigation = current => Object.keys(tree).map(item => ({
  name: tree[item].title,
  isCurrent: true,
  submenu: Object.keys(tree[item].children).map(i => ({
    name: tree[item].children[i].title,
    isCurrent: current === i,
    link: createItemFileName('gs', i)
  }))
}
))

const gettingStarted = () => {
  console.log('Rendering getting started')

  // index
  const index = fs.readFileSync(path.resolve(gsPath, '../README.md'), 'utf8')
  const indexWithLinks = replaceGitLabLinks(index)
  renderFile({
    navigation: createGSNavigation(''),
    html: md.render(indexWithLinks),
    tableOfContent: []
  },
  path.resolve(__dirname, '../../tmpl/vue/gettingStarted.vue'),
  path.resolve(__dirname, '../../tmpl/html/pageTemplate.html'),
  path.resolve(outdir, '../gettingstarted', 'index.html')
  )

  if (!fs.existsSync(path.resolve(outdir, '../gettingstarted'))) {
    fs.mkdirSync(path.resolve(outdir, '../gettingstarted'))
  }

  const src = path.resolve(gsPath, 'img')
  const dist = path.resolve(outdir, '../gettingstarted')

  shell.mkdir('-p', dist)
  shell.cp('-rf', src, dist)

  fs.readdirSync(gsPath, { withFileTypes: true })
    .filter(item => !item.isDirectory())
    .map(file => file.name)
    .filter(file => file.endsWith('.md'))
    .forEach(file => {
      const page = fs.readFileSync(path.resolve(gsPath, file), 'utf8')

      // move menu from page to table-of-content
      // create table of content
      const menu = page
        .match(/<a name="menu"><\/a>(.*)<a name="endmenu"><\/a>/s)[1]
        .trim()
        .split('\n')
        .map(line => line.match(/\[(.*)]\((#.*)\)/))
        .map(([__, name, link]) => ({
          name,
          link
        }))
      const tableOfContent = [{ name: 'Menu', props: menu }]
      // delete menu from page
      const pageWithoutMenu = page.replace(/<a name="menu"><\/a>(.*)<a name="endmenu"><\/a>/s, '')

      const html = md.render(replaceGitLabLinks(pageWithoutMenu))

      renderFile({
        navigation: createGSNavigation(file.slice(0, file.indexOf('.'))),
        html,
        tableOfContent
      },
      path.resolve(__dirname, '../../tmpl/vue/gettingStarted.vue'),
      path.resolve(__dirname, '../../tmpl/html/pageTemplate.html'),
      path.resolve(outdir, '../gettingstarted', createItemFileName('gs', file.slice(0, file.indexOf('.'))))
      )
    })
}

module.exports = gettingStarted
