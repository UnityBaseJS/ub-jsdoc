const fs = require('fs')
const path = require('path')
const parse = require('jsdoc/util/markdown').getParser()
/**
 * This plugin adds a module name specified in custom tag `memberOfModule` to the `memberOf` tag value.
 * Problem solved here is WebStorm code insight. WebStorm do not understand module:.... syntax
 *
 * In addition it will attach README.md to the modules main page (instead of description)
 *
 * @module plugins/memberOfModule
 * @author Pavel Mash <pavel.mash@gmail.com>
 */
exports.handlers = {
  newDoclet: function (e) {
    if (!e.doclet) return
    var doclet = e.doclet
    var memberof = doclet.memberof || ''
    var memberOfModule

    if (doclet.tags && !memberof.startsWith('module:')) {
      memberOfModule = doclet.tags.find(function (tag) { return tag.title === 'memberofmodule' })
      if (memberOfModule) {
        doclet.memberof = 'module:' + memberOfModule.value + '~' + memberof
      }
    }
    // for a main module file attach readme
    if (doclet.kind === 'module' && !doclet.memberof && (doclet.readme === undefined) && doclet.meta.path) {
      let readmePath = path.join(doclet.meta.path, 'README.md')
      if (fs.existsSync(readmePath)) {
        doclet.readme = parse(fs.readFileSync(readmePath, 'utf-8'))
        delete doclet.description
      }
    }
  }
}
