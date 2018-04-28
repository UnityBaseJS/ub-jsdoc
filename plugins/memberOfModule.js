/**
 * This plugin adds a module name specified in custom tag
 * `memberOfModule` to the `memberOf` tag value.
 * Problem solved here is WebStorm code insight. WebStorm do not understand module:.... syntax
 * @module plugins/memberOfModule
 * @author Pavel Mash <pavel.mash@gmail.com>
 */
exports.handlers = {
  newDoclet: function (e) {
    if (!e.doclet) return
    var doclet = e.doclet
    var memberof = doclet.memberof || ''
    var memberOfModule
    if (doclet.tags && doclet.tags.find(function (tag) {return tag.title === 'memberofmodule'})) debugger	
    if (doclet.tags && !memberof.startsWith('module:')) {
      memberOfModule = doclet.tags.find(function (tag) {return tag.title === 'memberofmodule'})
      if (memberOfModule) {
        doclet.memberof = 'module:' + memberOfModule.value + '~' + memberof
      }
    }
  }
}
