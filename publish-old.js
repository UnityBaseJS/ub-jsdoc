/* global env */

const doop = require('jsdoc/util/doop')
const fs = require('jsdoc/fs')
const helper = require('jsdoc/util/templateHelper')
const logger = require('jsdoc/util/logger')
const path = require('jsdoc/path')
const taffy = require('taffydb').taffy
const template = require('jsdoc/template')
const util = require('util')

const htmlsafe = helper.htmlsafe
const linkto = helper.linkto
const resolveAuthorLinks = helper.resolveAuthorLinks
const hasOwnProp = Object.prototype.hasOwnProperty

var data
var view

var outdir = path.normalize(env.opts.destination)

function find (spec) {
  return helper.find(data, spec)
}

function tutoriallink (tutorial) {
  return helper.toTutorial(tutorial, null, { tag: 'em', classname: 'disabled', prefix: 'Tutorial: ' })
}

function getAncestorLinks (doclet) {
  return helper.getAncestorLinks(data, doclet)
}

function hashToLink (doclet, hash) {
  if (!/^(#.+)/.test(hash)) { return hash }

  var url = helper.createLink(doclet)

  url = url.replace(/(#.+|$)/, hash)
  return '<a href="' + url + '">' + hash + '</a>'
}

function needsSignature (doclet) {
  var needsSig = false

  // function and class definitions always get a signature
  if (doclet.kind === 'function' || doclet.kind === 'class') {
    needsSig = true
  } else if (doclet.kind === 'typedef' && doclet.type && doclet.type.names &&
    // typedefs that contain functions get a signature, too
    doclet.type.names.length) {
    for (let i = 0, l = doclet.type.names.length; i < l; i++) {
      if (doclet.type.names[i].toLowerCase() === 'function') {
        needsSig = true
        break
      }
    }
  }

  return needsSig
}

function getSignatureAttributes (item) {
  let attributes = []
  if (item.optional) attributes.push('opt')
  if (item.nullable === true) {
    attributes.push('nullable')
  } else if (item.nullable === false) {
    attributes.push('non-null')
  }
  return attributes
}

function updateItemName (item) {
  let attributes = getSignatureAttributes(item)
  let itemName = item.name || ''

  if (item.variable) {
    itemName = '&hellip;' + itemName
  }
  if (attributes && attributes.length) {
    itemName = util.format('%s<span class="signature-attributes">%s</span>', itemName,
      attributes.join(', '))
  }
  return itemName
}

function addParamAttributes (params) {
  return params.filter(function (param) {
    return param.name && param.name.indexOf('.') === -1
  }).map(updateItemName)
}

function buildItemTypeStrings (item) {
  if (!item || !item.type || !item.type.names) return []
  return item.type.names.map((name) => linkto(name, htmlsafe(name)))
}

function buildAttribsString (attribs) {
  if (!attribs || !attribs.length) return ''
  return htmlsafe(util.format('(%s) ', attribs.join(', ')))
}

function addNonParamAttributes (items) {
  let types = []
  items.forEach(function (item) {
    types = types.concat(buildItemTypeStrings(item))
  })
  return types
}

function addSignatureParams (f) {
  let params = f.params ? addParamAttributes(f.params) : []
  f.signature = util.format('%s(%s)', (f.signature || ''), params.join(', '))
}

function addSignatureReturns (f) {
  var attribs = []
  var attribsString = ''
  var returnTypes = []
  var returnTypesString = ''

  // jam all the return-type attributes into an array. this could create odd results (for example,
  // if there are both nullable and non-nullable return types), but let's assume that most people
  // who use multiple @return tags aren't using Closure Compiler type annotations, and vice-versa.
  if (f.returns) {
    f.returns.forEach(function (item) {
      helper.getAttribs(item).forEach(function (attrib) {
        if (attribs.indexOf(attrib) === -1) {
          attribs.push(attrib)
        }
      })
    })
    attribsString = buildAttribsString(attribs)
  }

  if (f.returns) {
    returnTypes = addNonParamAttributes(f.returns)
  }
  if (returnTypes.length) {
    returnTypesString = util.format(' &rarr; %s %s', attribsString, returnTypes.join('|'))
  }

  f.signature = '<span class="signature">' + (f.signature || '') + '</span>' +
    '<span class="type-signature">' + returnTypesString + '</span>'
}

function addSignatureTypes (f) {
  let types = f.type ? buildItemTypeStrings(f) : []

  f.signature = (f.signature || '') + '<span class="type-signature">' +
    (types.length ? ': ' + types.join('|') : '') + '</span>'
}

function addAttribs (f) {
  let attribs = helper.getAttribs(f)
  let attribsString = buildAttribsString(attribs)

  f.attribs = util.format('<span class="type-signature">%s</span>', attribsString)
  f.attribsRaw = (attribs && attribs.length) ? attribs : []
}

function shortenPaths (files, commonPrefix) {
  Object.keys(files).forEach(function (file) {
    files[file].shortened = files[file].resolved.replace(commonPrefix, '')
    // always use forward slashes
      .replace(/\\/g, '/')
  })
  return files
}

function getPathFromDoclet (doclet) {
  if (!doclet.meta) return null

  return doclet.meta.path && doclet.meta.path !== 'null'
    ? path.join(doclet.meta.path, doclet.meta.filename)
    : doclet.meta.filename
}

function generate (type, title, docs, filename, resolveLinks) {
  resolveLinks = resolveLinks !== false

  var docData = {
    type: type,
    title: title,
    docs: docs
  }

  let outpath = path.join(outdir, filename)
  let html = view.render('container.tmpl', docData)
  if (resolveLinks) {
    html = helper.resolveLinks(html) // turn {@link foo} into <a href="foodoc.html">foo</a>
  }

  fs.writeFileSync(outpath, html, 'utf8')
}

function generatePartial (type, title, docs, filename, resolveLinks) {
  resolveLinks = resolveLinks !== false

  var docData = {
    type: type,
    title: title,
    docs: docs
  }

  var originalLayout = view.layout
  view.layout = 'partial_layout.tmpl'
  let outpath = path.join(outdir, 'partials', filename)
  let html = view.render('container.tmpl', docData)
  view.layout = originalLayout
  if (resolveLinks) {
    html = helper.resolveLinks(html) // turn {@link foo} into <a href="foodoc.html">foo</a>
  }

  fs.writeFileSync(outpath, html, 'utf8')
}

function generateSourceFiles (sourceFiles, encoding) {
  encoding = encoding || 'utf8'
  Object.keys(sourceFiles).forEach(function (file) {
    var source
    // links are keyed to the shortened path in each doclet's `meta.shortpath` property
    var sourceOutfile = helper.getUniqueFilename(sourceFiles[file].shortened)
    helper.registerLink(sourceFiles[file].shortened, sourceOutfile)

    try {
      source = {
        kind: 'source',
        code: helper.htmlsafe(fs.readFileSync(sourceFiles[file].resolved, encoding))
      }
    } catch (e) {
      logger.error('Error while generating source file %s: %s', file, e.message)
    }
    generate('Source', sourceFiles[file].shortened, [source], sourceOutfile, false)
  })
}

/**
 * Look for classes or functions with the same name as modules (which indicates that the module
 * exports only that class or function), then attach the classes or functions to the `module`
 * property of the appropriate module doclets. The name of each class or function is also updated
 * for display purposes. This function mutates the original arrays.
 *
 * @private
 * @param {Array.<module:jsdoc/doclet.Doclet>} doclets - The array of classes and functions to
 * check.
 * @param {Array.<module:jsdoc/doclet.Doclet>} modules - The array of module doclets to search.
 */
function attachModuleSymbols (doclets, modules) {
  var symbols = {}

  // build a lookup table
  doclets.forEach(function (symbol) {
    symbols[symbol.longname] = symbols[symbol.longname] || []
    symbols[symbol.longname].push(symbol)
  })

  return modules.map(function (module) {
    if (symbols[module.longname]) {
      module.modules = symbols[module.longname]
      // Only show symbols that have a description. Make an exception for classes, because
      // we want to show the constructor-signature heading no matter what.
        .filter(function (symbol) {
          return symbol.description || symbol.kind === 'class'
        })
        .map(function (symbol) {
          symbol = doop(symbol)

          if (symbol.kind === 'class' || symbol.kind === 'function') {
            symbol.name = symbol.name.replace('module:', '(require("') + '"))'
          }

          return symbol
        })
    }
  })
}

function idGeneratorFabric (prefix) {
  let id = 1
  return function () {
    return prefix + (id++)
  }
}

let getNavID = idGeneratorFabric('n')
let getFTSid = idGeneratorFabric('f')

let lunr = require('lunr')
let ftsIndex = lunr(function () {
  this.ref('id')
  this.field('name', { boost: 5 })
  this.field('description', { boost: 1 })
})
let ftsData = {}

function addToSearch (member, group) {
  let id = getFTSid()
  if (group === 'Tutorials') {
    ftsIndex.add({
      id: id,
      name: member.title,
      description: member.content /* for tutorials */
    })
    ftsData[id] = {
      href: helper.tutorialToUrl(member.name),
      path: member.title,
      group: group,
      name: member.title
    }
  } else {
    ftsIndex.add({
      id: id,
      name: member.name,
      description: member.classdesc || member.description || member.content /* for tutorials */
    })
    ftsData[id] = {
      href: helper.longnameToUrl[member.longname],
      path: member.longname,
      group: group,
      name: member.name
    }
  }
}

function buildMemberNav (items, itemHeading, itemsSeen, linktoFn) {
  var nav = ''
  var itemsNav = ''

  function addContainer (item) {
    let containerHTML = '<li>'
    let childCount
    if (!hasOwnProp.call(item, 'longname')) {
      containerHTML += linktoFn('', item.name)
    } else if (!hasOwnProp.call(itemsSeen, item.longname)) {
      itemsSeen[item.longname] = true
      if (itemHeading !== 'Tutorials') {
        if (!item.ancestors.length) { // not a member of any other module
          let methods = find({ kind: 'function', memberof: item.longname })
          let classes = find({ kind: 'class', memberof: item.longname })
          let members = find({ kind: 'member', memberof: item.longname })
          let submodules = find({ kind: 'module', memberof: item.longname })
          let events = find({ kind: 'event', memberof: item.longname })

          let id = getNavID()
          childCount = methods.length + classes.length + members.length + submodules.length

          if (childCount) {
            containerHTML += '<input type="checkbox" id="' + id + '"/>'
          }
          containerHTML += '<label for="' + id + '">' + linktoFn(item.longname, item.name.replace(/^module:/, ''), 'member-kind-' + item.kind + (item.deprecated ? ' deprecated' : '')) + '</label>'
          if (childCount) {
            containerHTML += '<section>'
            containerHTML += generateChildByType(methods)
            containerHTML += generateChildByType(members)
            containerHTML += generateChildByType(submodules)
            containerHTML += generateChildByType(events)

            for (let cIdx = 0, cLen = classes.length; cIdx < cLen; cIdx++) {
              containerHTML += '<ul>' + addContainer(classes[cIdx]) + '</ul>'
            }
            containerHTML += '</section>'
          }
        }
      } else {
        let id = getNavID()
        childCount = item.children.length
        if (childCount) {
          containerHTML += '<input type="checkbox" id="' + id + '"/>'
        }
        containerHTML += '<label for="' + id + '">' + linktoFn(item.longname, item.name.replace(/^module:/, ''), 'member-kind-' + item.kind + (item.deprecated ? ' deprecated' : '')) + '</label>'
        // addToSearch(item, itemHeading);
        if (childCount) {
          containerHTML += '<section>'
          for (let cIdx = 0, cLen = item.children.length; cIdx < cLen; cIdx++) {
            containerHTML += '<ul>' + addContainer(item.children[cIdx]) + '</ul>'
          }
          containerHTML += '</section>'
        }
      }
    }
    return containerHTML + '</li>'
  }

  function generateChildByType (members) {
    var itemsHTML = ''
    if (members.length) {
      itemsHTML = '<ul>'
      members.forEach(function (member) {
        itemsHTML += '<li>'
        itemsHTML += linktoFn(member.longname, member.name, 'member-kind-' + member.kind + (member.deprecated ? ' deprecated' : ''))
        itemsHTML += '</li>'
      })
      itemsHTML += '</ul>'
    }
    return itemsHTML
  }

  function buildSearchIndex (item) {
    addToSearch(item, itemHeading)
    if (itemHeading !== 'Tutorials') {
      let classes = find({ kind: 'class', memberof: item.longname })
      classes.forEach(function (member) {
        buildSearchIndex(member)
      })
      let methods = find({ kind: 'function', memberof: item.longname })
      methods.forEach(function (member) {
        addToSearch(member, itemHeading)
      })
      let members = find({ kind: 'member', memberof: item.longname })
      members.forEach(function (member) {
        addToSearch(member, itemHeading)
      })
    } else {
      for (let cIdx = 0, cLen = item.children.length; cIdx < cLen; cIdx++) {
        buildSearchIndex(item.children[cIdx])
      }
    }
  }

  if (items && items.length) {
    items.forEach(function (item) {
      itemsNav += addContainer(item)
    })

    items.forEach(function (item) {
      buildSearchIndex(item)
    })

    if (itemsNav !== '') {
      nav += '<h3>' + itemHeading + '</h3><ul>' + itemsNav + '</ul>'
    }
  }

  return nav
}

function linktoTutorial (longName, name) {
  return tutoriallink(name)
}

function linktoExternal (longName, name) {
  return linkto(longName, name.replace(/(^"|"$)/g, ''))
}

/**
 * Create the navigation sidebar.
 * @param {object} members The members that will be used to create the sidebar.
 * @param {array<object>} members.classes
 * @param {array<object>} members.externals
 * @param {array<object>} members.globals
 * @param {array<object>} members.mixins
 * @param {array<object>} members.modules
 * @param {array<object>} members.namespaces
 * @param {array<object>} members.tutorials
 * @param {array<object>} members.events
 * @param {array<object>} members.interfaces
 * @return {string} The HTML for the navigation sidebar.
 */
function buildNav (members, conf) {
  var nav = '<h3><a href="index.html">Home</a></h3>'
  var seen = {}
  var seenTutorials = {}

  if (conf && conf.links && conf.links.length) {
    nav += '<section><h3>Other docs</h3><ul>'
    conf.links.forEach(function (link) {
      nav += '<li><a href="' + link.href + '">' + link.text + '</a></li>'
    })
    nav += '</ul></section>'
  }
  // the order here is important - we need to parse modules & namespaces before classes
  // to mark a class as seen
  nav += buildMemberNav(members.tutorials, 'Tutorials', seenTutorials, linktoTutorial, 'tutorial')
  nav += buildMemberNav(members.modules, 'Modules', seen, linkto, 'module')
  nav += buildMemberNav(members.namespaces, 'Namespaces', seen, linkto, 'ns')
  nav += buildMemberNav(members.classes, 'Classes', seen, linkto, 'class')
  nav += buildMemberNav(members.interfaces, 'Interfaces', seen, linkto, 'interface')
  nav += buildMemberNav(members.events, 'Events', seen, linkto, 'event')
  nav += buildMemberNav(members.mixins, 'Mixins', seen, linkto, 'mixin')
  nav += buildMemberNav(members.externals, 'Externals', seen, linktoExternal)

  if (members.globals.length) {
    var globalNav = ''

    members.globals.forEach(function (g) {
      if (g.kind !== 'typedef' && !hasOwnProp.call(seen, g.longname)) {
        globalNav += '<li class="member-kind-' + g.kind + (g.deprecated ? ' deprecated' : '') + '"><label>' + linkto(g.longname, g.name) + '</label></li>'
        addToSearch(g, 'global\'s')
      }
      seen[g.longname] = true
    })

    if (!globalNav) {
      // turn the heading into a link so you can actually get to the global page
      nav += '<h3>' + linkto('global', 'Global') + '</h3>'
    } else {
      nav += '<h3>Global</h3><ul>' + globalNav + '</ul>'
    }
  }

  return nav
}

/**
 @param {TAFFY} taffyData See <http://taffydb.com/>.
 @param {object} opts
 @param {Tutorial} tutorials
 */
exports.publish = function (taffyData, opts, tutorials) {
  data = taffyData

  // var conf = env.conf.templates || {}
  // conf.default = conf.default || {}
  //
  // var templatePath = path.normalize(opts.template)
  // view = new template.Template(path.join(templatePath, 'tmpl'))
  // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
  // doesn't try to hand them out later
  // var indexUrl = helper.getUniqueFilename('index')
  // don't call registerLink() on this one! 'index' is also a valid longname
  // var globalUrl = helper.getUniqueFilename('global')
  // helper.registerLink('global', globalUrl)
  // set up templating
  // view.layout = conf.default.layoutFile
  //   ? path.getResourcePath(path.dirname(conf.default.layoutFile),
  //     path.basename(conf.default.layoutFile))
  //   : 'layout.tmpl'
  // set up tutorials for helper
  // helper.setTutorials(tutorials)

  data = helper.prune(data)
  data.sort('longname, version, since')
  debugger
  const allData = data().get()
  /*
   classdesc: "<p>Singleton instance of UnityBase application. Allow direct access to the database connections, blob stores,↵HTTP endpoints (full control on HTTP request &amp; response) registration, read domain and server config.</p>↵<p>Mixes EventEmitter, and server will emit:</p>↵<ul>↵<li><code>endpointName + ':before'</code> event before endpoint handler  execution</li>↵<li><code>endpointName + ':after'</code> event in case neither exception is raised nor App.preventDefault()↵is called inside endpoint handler</li>↵</ul>↵<pre class="prettyprint source"><code> const App = require('@unitybase/ub').App↵ // Register public (accessible without authentication) endpoint↵ App.registerEndpoint('echoToFile', echoToFile, false)↵↵ // write custom request body to file FIXTURES/req and echo file back to client↵ // @param {THTTPRequest} req↵ // @param {THTTPResponse} resp↵ function echoToFile (req, resp) {↵   var fs = require('fs')↵   fs.writeFileSync(path.join(FIXTURES, 'req'), req.read('bin'))↵   resp.statusCode = 200↵   resp.writeEnd(fs.readFileSync(path.join(FIXTURES, 'req'), {encoding: 'bin'}))↵ }↵↵ //Before getDocument requests↵ //@param {THTTPRequest} req↵ //@param {THTTPResponse} resp↵ function doSomethingBeforeGetDocumentCall(req, resp){↵   console.log('User with ID', Session.userID, 'try to get document')↵ }↵ // Adds hook called before each call to getDocument endpoint↵ App.on('getDocument:before', doSomethingBeforeGetDocumentCall)↵↵ const querystring = require('querystring')↵ //↵ //After getDocument requests↵ //@param {THTTPRequest} req↵ //@param {THTTPResponse} resp↵ function doSomethingAfterGetDocumentCall(req, resp){↵   params = querystring.parse(req.parameters)↵   console.log('User with ID', Session.userID, 'obtain document using params',  params)↵ }↵ App.on('getDocument:after', doSomethingAfterGetDocumentCall)</code></pre><p>To prevent endpoint handler execution App.preventDefault() can be used inside <code>:before</code> handler.</p>"
  comment: " *↵ * @classdesc↵ * Singleton instance of UnityBase application. Allow direct access to the database connections, blob stores,↵ * HTTP endpoints (full control on HTTP request & response) registration, read domain and server config.↵ *↵ * Mixes EventEmitter, and server will emit:↵ *↵ *  - `endpointName + ':before'` event before endpoint handler  execution↵ *  - `endpointName + ':after'` event in case neither exception is raised nor App.preventDefault()↵ *  is called inside endpoint handler↵ *↵ *↵     const App = require('@unitybase/ub').App↵     // Register public (accessible without authentication) endpoint↵     App.registerEndpoint('echoToFile', echoToFile, false)↵↵     // write custom request body to file FIXTURES/req and echo file back to client↵     // @param {THTTPRequest} req↵     // @param {THTTPResponse} resp↵     function echoToFile (req, resp) {↵       var fs = require('fs')↵       fs.writeFileSync(path.join(FIXTURES, 'req'), req.read('bin'))↵       resp.statusCode = 200↵       resp.writeEnd(fs.readFileSync(path.join(FIXTURES, 'req'), {encoding: 'bin'}))↵     }↵↵     //Before getDocument requests↵     //@param {THTTPRequest} req↵     //@param {THTTPResponse} resp↵     function doSomethingBeforeGetDocumentCall(req, resp){↵       console.log('User with ID', Session.userID, 'try to get document')↵     }↵     // Adds hook called before each call to getDocument endpoint↵     App.on('getDocument:before', doSomethingBeforeGetDocumentCall)↵↵     const querystring = require('querystring')↵     //↵     //After getDocument requests↵     //@param {THTTPRequest} req↵     //@param {THTTPResponse} resp↵     function doSomethingAfterGetDocumentCall(req, resp){↵       params = querystring.parse(req.parameters)↵       console.log('User with ID', Session.userID, 'obtain document using params',  params)↵     }↵     App.on('getDocument:after', doSomethingAfterGetDocumentCall)↵↵ *↵ * To prevent endpoint handler execution App.preventDefault() can be used inside `:before` handler.↵ *↵ * @class App↵ * @mixes EventEmitter↵ * n/"
    kind: "class"
    longname: "App"
    meta: {filename: "App.js", lineno: 14, columnno: 0, path: "/home/andrey/dev/ubjs/packages/ub/modules", code: {…}}
    mixes: ["EventEmitter"]
    name: "App"
    scope: "global"
    ___id: "T000002R005674"
    ___s: true
   */

  /*description: "Databases connections"
  kind: "member"
  longname: "App.dbConnections"
  memberof: "App"
  meta: {range: Array(2), filename: "App.js", lineno: 399, columnno: 0, path: "/home/andrey/dev/ubjs/packages/ub/modules", …}
  name: "dbConnections"
  scope: "static"
  type: {names: Array(1), parsedType: {…}}
  ___id: "T000002R005722"
  ___s: true*/
  const Vue = require('vue')

  const context = {
    title: 'hello',
    meta: `
    <meta ...>
    <meta ...>
  `
  }
  const superClasses = allData.filter(({ kind }) => kind === 'class')
  const superMembers = allData.filter(({ kind }) => kind === 'member')

  superClasses.forEach(clazz => {
    const app = new Vue({
      data: {
        classs: clazz,
        members: superMembers.filter(({memberof}) => memberof === clazz.name)
      },
      template: require('fs').readFileSync('/home/andrey/dev/ub-jsdoc/class.template.vue', 'utf-8')
    })

    const renderer = require('vue-server-renderer').createRenderer({
      template: require('fs').readFileSync('/home/andrey/dev/ub-jsdoc/class.template.html', 'utf-8')
    })

    renderer.renderToString(app, context).then(html => {
      require('fs').writeFileSync(`/home/andrey/dev/ub-jsdoc/renders/${clazz.name}.html`, html)
    }).catch(err => {
      console.error(err)
    })
  })


  // helper.addEventListeners(data)
  //
  // var sourceFiles = {}
  // var sourceFilePaths = []
  // data().each(function (doclet) {
  //   doclet.attribs = ''
  //
  //   if (doclet.examples) {
  //     doclet.examples = doclet.examples.map(function (example) {
  //       var caption, code
  //
  //       if (example.match(/^\s*<caption>([\s\S]+?)<\/caption>(\s*[\n\r])([\s\S]+)$/i)) {
  //         caption = RegExp.$1
  //         code = RegExp.$3
  //       }
  //
  //       return {
  //         caption: caption || '',
  //         code: code || example
  //       }
  //     })
  //   }
  //   if (doclet.see) {
  //     doclet.see.forEach(function (seeItem, i) {
  //       doclet.see[i] = hashToLink(doclet, seeItem)
  //     })
  //   }
  //
  //   // build a list of source files
  //   var sourcePath
  //   if (doclet.meta) {
  //     sourcePath = getPathFromDoclet(doclet)
  //     sourceFiles[sourcePath] = {
  //       resolved: sourcePath,
  //       shortened: null
  //     }
  //     if (sourceFilePaths.indexOf(sourcePath) === -1) {
  //       sourceFilePaths.push(sourcePath)
  //     }
  //   }
  // })
  //
  // // update outdir if necessary, then create outdir
  // var packageInfo = (find({ kind: 'package' }) || [])[0]
  // if (packageInfo && packageInfo.name) {
  //   outdir = path.join(outdir, packageInfo.name, (packageInfo.version || ''))
  // }
  // fs.mkPath(outdir)
  // fs.mkPath(path.join(outdir, 'partials'))
  //
  // // copy the template's static files to outdir
  // var fromDir = path.join(templatePath, 'static')
  // var staticFiles = fs.ls(fromDir, 3)
  //
  // staticFiles.forEach(function (fileName) {
  //   var toDir = fs.toDir(fileName.replace(fromDir, outdir))
  //   fs.mkPath(toDir)
  //   fs.copyFileSync(fileName, toDir)
  // })
  //
  // // copy user-specified static files to outdir
  // var staticFilePaths
  // var staticFileFilter
  // var staticFileScanner
  // if (conf.default.staticFiles) {
  //   // The canonical property name is `include`. We accept `paths` for backwards compatibility
  //   // with a bug in JSDoc 3.2.x.
  //   staticFilePaths = conf.default.staticFiles.include ||
  //     conf.default.staticFiles.paths ||
  //     []
  //   staticFileFilter = new (require('jsdoc/src/filter')).Filter(conf.default.staticFiles)
  //   staticFileScanner = new (require('jsdoc/src/scanner')).Scanner()
  //
  //   staticFilePaths.forEach(function (filePath) {
  //     var extraStaticFiles = staticFileScanner.scan([filePath], 10, staticFileFilter)
  //
  //     extraStaticFiles.forEach(function (fileName) {
  //       var sourcePath = fs.toDir(filePath)
  //       var toDir = fs.toDir(fileName.replace(sourcePath, outdir))
  //       fs.mkPath(toDir)
  //       fs.copyFileSync(fileName, toDir)
  //     })
  //   })
  // }
  //
  // if (sourceFilePaths.length) {
  //   sourceFiles = shortenPaths(sourceFiles, path.commonPrefix(sourceFilePaths))
  // }
  // data().each(function (doclet) {
  //   var url = helper.createLink(doclet)
  //   helper.registerLink(doclet.longname, url)
  //
  //   // add a shortened version of the full path
  //   var docletPath
  //   if (doclet.meta) {
  //     docletPath = getPathFromDoclet(doclet)
  //     docletPath = sourceFiles[docletPath].shortened
  //     if (docletPath) {
  //       doclet.meta.shortpath = docletPath
  //     }
  //   }
  // })
  //
  // data().each(function (doclet) {
  //   var url = helper.longnameToUrl[doclet.longname]
  //
  //   if (url.indexOf('#') > -1) {
  //     doclet.id = helper.longnameToUrl[doclet.longname].split(/#/).pop()
  //   } else {
  //     doclet.id = doclet.name
  //   }
  //
  //   if (needsSignature(doclet)) {
  //     addSignatureParams(doclet)
  //     addSignatureReturns(doclet)
  //     addAttribs(doclet)
  //   }
  // })
  //
  // // do this after the urls have all been generated
  // data().each(function (doclet) {
  //   doclet.ancestors = getAncestorLinks(doclet)
  //
  //   if (doclet.kind === 'member') {
  //     addSignatureTypes(doclet)
  //     addAttribs(doclet)
  //   }
  //
  //   if (doclet.kind === 'constant') {
  //     addSignatureTypes(doclet)
  //     addAttribs(doclet)
  //     doclet.kind = 'member'
  //   }
  // })
  //
  // var members = helper.getMembers(data)
  // // sort a top-level tutorials by it's name
  // if (tutorials.children.length) {
  //   tutorials.children.sort((a, b) => a.title > b.title ? 1 : (a.title < b.title ? -1 : 0))
  // }
  // members.tutorials = tutorials.children
  //
  // // output pretty-printed source files by default
  // var outputSourceFiles = conf.default && conf.default.outputSourceFiles !== false
  //
  // // add template helpers
  // view.find = find
  // view.linkto = linkto
  // view.resolveAuthorLinks = resolveAuthorLinks
  // view.tutoriallink = tutoriallink
  // view.htmlsafe = htmlsafe
  // view.outputSourceFiles = outputSourceFiles
  // // allow to analyse config in templates
  // view.conf = conf
  //
  // attachModuleSymbols(find({ longname: { left: 'module:' } }), members.modules)
  //
  // // generate the pretty-printed source files first so other pages can link to them
  // if (outputSourceFiles) {
  //   generateSourceFiles(sourceFiles, opts.encoding)
  // }
  //
  // view.nav = buildNav(members, conf)
  // // save constructed FTS data
  // var ftsPath = path.join(outdir, 'ftsIndex.json')
  // fs.writeFileSync(ftsPath, JSON.stringify(ftsIndex))
  // ftsPath = path.join(outdir, 'ftsData.json')
  // fs.writeFileSync(ftsPath, JSON.stringify(ftsData))
  //
  // // index page displays information from package.json and lists files
  // var files = find({ kind: 'file' })
  // var packages = find({ kind: 'package' })
  //
  // generate('', 'Home',
  //   packages.concat(
  //     [{ kind: 'mainpage', readme: opts.readme, longname: (opts.mainpagetitle) ? opts.mainpagetitle : 'Main Page' }]
  //   ).concat(files),
  //   indexUrl)
  // generatePartial('', 'Home',
  //   packages.concat(
  //     [{ kind: 'mainpage', readme: opts.readme, longname: (opts.mainpagetitle) ? opts.mainpagetitle : 'Main Page' }]
  //   ).concat(files),
  //   indexUrl)
  //
  // if (members.globals.length) {
  //   generate('', 'Global', [{ kind: 'globalobj' }], globalUrl)
  //   generatePartial('', 'Global', [{ kind: 'globalobj' }], globalUrl)
  // }
  //
  // // set up the lists that we'll use to generate pages
  // var classes = taffy(members.classes)
  // var modules = taffy(members.modules)
  // var namespaces = taffy(members.namespaces)
  // var mixins = taffy(members.mixins)
  // var externals = taffy(members.externals)
  // var interfaces = taffy(members.interfaces)
  //
  // Object.keys(helper.longnameToUrl).forEach(function (longname) {
  //   var myModules = helper.find(modules, { longname: longname })
  //   if (myModules.length) {
  //     generate('Module', myModules[0].name, myModules, helper.longnameToUrl[longname])
  //     generatePartial('Module', myModules[0].name, myModules, helper.longnameToUrl[longname])
  //   }
  //
  //   var myClasses = helper.find(classes, { longname: longname })
  //   if (myClasses.length) {
  //     generate('Class', myClasses[0].name, myClasses, helper.longnameToUrl[longname])
  //     generatePartial('Class', myClasses[0].name, myClasses, helper.longnameToUrl[longname])
  //   }
  //
  //   var myNamespaces = helper.find(namespaces, { longname: longname })
  //   if (myNamespaces.length) {
  //     generate('Namespace', myNamespaces[0].name, myNamespaces, helper.longnameToUrl[longname])
  //     generatePartial('Namespace', myNamespaces[0].name, myNamespaces, helper.longnameToUrl[longname])
  //   }
  //
  //   var myMixins = helper.find(mixins, { longname: longname })
  //   if (myMixins.length) {
  //     generate('Mixin', myMixins[0].name, myMixins, helper.longnameToUrl[longname])
  //     generatePartial('Mixin', myMixins[0].name, myMixins, helper.longnameToUrl[longname])
  //   }
  //
  //   var myExternals = helper.find(externals, { longname: longname })
  //   if (myExternals.length) {
  //     generate('External', myExternals[0].name, myExternals, helper.longnameToUrl[longname])
  //     generatePartial('External', myExternals[0].name, myExternals, helper.longnameToUrl[longname])
  //   }
  //
  //   var myInterfaces = helper.find(interfaces, { longname: longname })
  //   if (myInterfaces.length) {
  //     generate('Interface', myInterfaces[0].name, myInterfaces, helper.longnameToUrl[longname])
  //     generatePartial('Interface', myInterfaces[0].name, myInterfaces, helper.longnameToUrl[longname])
  //   }
  // })
  //
  // // TODO: move the tutorial functions to templateHelper.js
  // function generateTutorial (title, tutorial, filename) {
  //   var parsedTutorial = tutorial.parse()
  //   var tutorialData = {
  //     title: title,
  //     header: tutorial.title,
  //     content: parsedTutorial,
  //     children: tutorial.children
  //   }
  //
  //   var tutorialPath = path.join(outdir, filename)
  //   var html = view.render('tutorial.tmpl', tutorialData)
  //
  //   // yes, you can use {@link} in tutorials too!
    html = helper.resolveLinks(html) // turn {@link foo} into <a href="foodoc.html">foo</a>
  //   fs.writeFileSync(tutorialPath, html, 'utf8')
  //
  //   // generate a partial
  //   var originalLayout = view.layout
  //   view.layout = 'partial_layout.tmpl'
  //   tutorialPath = path.join(outdir, 'partials', filename)
  //   // view.render mutate a tutorialData.content :(
  //   tutorialData.content = parsedTutorial
  //   html = view.render('tutorial.tmpl', tutorialData)
  //   html = helper.resolveLinks(html) // turn {@link foo} into <a href="foodoc.html">foo</a>
  //   view.layout = originalLayout
  //   fs.writeFileSync(tutorialPath, html, 'utf8')
  // }
  //
  // // tutorials can have only one parent so there is no risk for loops
  // function saveChildren (node) {
  //   node.children.forEach(function (child) {
  //     generateTutorial('Tutorial: ' + child.title, child, helper.tutorialToUrl(child.name))
  //     saveChildren(child)
  //   })
  // }
  //
  // saveChildren(tutorials)
}