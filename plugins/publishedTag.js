/**
 * This plugin handle `published` tag.
 * Useful in case method is a server-side API accessible from client.
 * @module plugins/publishedTag
 * @author Pavel Mash <pavel.mash@gmail.com>
 */
exports.handlers = {
  newDoclet: function (e) {
    if (!e.doclet) return
    var doclet = e.doclet
    var isPublished
    if (doclet.tags) {
      isPublished = doclet.tags.find(function (tag) {return tag.title === 'published'})
      if (isPublished) {
          doclet.access = 'published'
      }
    }
  }
}
