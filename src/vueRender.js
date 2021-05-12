const vueRender = require('vue-server-renderer')
const Vue = require('vue')
const fs = require('fs')
const path = require('path')

/**
 * Remove spaces and CR LF between tags from template to prevent unexpected whitespaces in HTML result
 * @param {string} tplStr
 */
function sanitizeTemplate (tplStr) {
  return tplStr
    .replace(/>(\s*?)</g, '><')
    .replace(/>(\s*?){{/g, '>{{')
    .replace(/}}(\s*?)</g, '}}<')
}
Vue.component('anchor', {
  props: ['member'],
  template: fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/elements/anchor.vue'), 'utf-8')
})
Vue.component('arguments-details', {
  props: ['args'],
  template: sanitizeTemplate(fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/elements/argumentsDetails.vue'), 'utf-8'))
})
Vue.component('func-signature', {
  props: ['func'],
  template: sanitizeTemplate(fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/elements/funcSignature.vue'), 'utf-8'))
})
Vue.component('func-params', {
  props: ['func'],
  template: sanitizeTemplate(fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/elements/funcParams.vue'), 'utf-8'))
})
Vue.component('func', {
  props: ['func'],
  template: fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/elements/func.vue'), 'utf-8')
})
Vue.component('member', {
  props: ['member'],
  template: fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/elements/member.vue'), 'utf-8')
})
Vue.component('type', {
  props: ['type'],
  template: fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/elements/type.vue'), 'utf-8')
})
Vue.component('event', {
  props: ['event'],
  template: fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/elements/event.vue'), 'utf-8')
})
Vue.component('example', {
  props: ['example'],
  template: fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/elements/example.vue'), 'utf-8')
})
Vue.component('sidebar', {
  props: ['navigation', 'with-search'],
  template: fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/elements/sidebar.vue'), 'utf-8')
})
Vue.component('t-o-content', {
  props: ['tableOfContent'],
  template: fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/elements/t-o-content.vue'), 'utf-8')
})

const articleProps = ['subclasses', 'submodules', 'mixins', 'members', 'funcs', 'types', 'events', 'tableOfContent']
Vue.component('clazz', {
  props: ['clazz', ...articleProps],
  template: fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/class.vue'), 'utf-8')
})
Vue.component('module', {
  props: ['module', ...articleProps],
  template: fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/module.vue'), 'utf-8')
})
Vue.component('mixin', {
  props: ['mixin', ...articleProps],
  template: fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/mixin.vue'), 'utf-8')
})
Vue.component('namespace', {
  props: ['namespace', ...articleProps],
  template: fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/namespace.vue'), 'utf-8')
})
Vue.component('interface', {
  props: ['interface', ...articleProps],
  template: fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/interface.vue'), 'utf-8')
})

Vue.component('chapter', {
  props: ['with-toc'],
  template: fs.readFileSync(path.resolve(__dirname, '../tmpl/vue/chapter.vue'), 'utf-8')
})

/**
 * Render one file
 * @param {object} data Page data
 * @param {string} vueTplPath
 * @param {string} htmlTplPath
 * @param {string} outputPath
 */
function renderFile (data, vueTplPath, htmlTplPath, outputPath) {
  const pageCmp = new Vue({
    data: { ...data, allData: data },
    template: fs.readFileSync(vueTplPath, 'utf-8')
  })

  const renderer = vueRender.createRenderer({
    template: fs.readFileSync(htmlTplPath, 'utf-8')
  })

  renderer.renderToString(pageCmp).then(html => {
    fs.writeFileSync(outputPath, html)
  }).catch(err => {
    console.error(err)
    process.exit(1)
  })
}

module.exports = renderFile
