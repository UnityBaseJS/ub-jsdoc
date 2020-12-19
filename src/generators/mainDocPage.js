const fs = require('fs')
const path = require('path')
const env = require('jsdoc/env')
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
const { copyFiles } = require('../utils')

const extendedConfig = env.conf.extendedConfig
const outdir = path.normalize(env.opts.destination)
const staticPath = path.resolve(env.opts.template, 'static')

const generate = (replaceAllLinks) => {
  const sideBarTree = extendedConfig.mainPageSideBar
  const indexNavigation = Object.keys(sideBarTree).map(item => ({
    name: sideBarTree[item].title,
    submenu: Object.keys(sideBarTree[item].children).map(menuItem => ({
      name: sideBarTree[item].children[menuItem].title,
      isCurrent: false,
      link: sideBarTree[item].children[menuItem].link
    }))
  }))
  const html = md.render(fs.readFileSync(path.resolve(outdir, '../../DOC-MAIN-PAGE.md'), 'utf-8'))
  copyFiles(path.resolve(staticPath, 'styles'), path.resolve(outdir, '../'))
  copyFiles(path.resolve(staticPath, 'scripts'), path.resolve(outdir, '../'))
  renderFile({
    readme: replaceAllLinks(html),
    navigation: indexNavigation,
    contents: []
  },
  path.resolve(__dirname, '../../tmpl/vue/mainDocIndex.vue'),
  path.resolve(__dirname, '../../tmpl/html/mainPageTemplate.html'),
  path.resolve(outdir, '../index.html'))
}

module.exports = generate
