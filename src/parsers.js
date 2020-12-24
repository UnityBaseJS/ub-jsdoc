const path = require('path')
const env = require('jsdoc/env')
const { parse: jsdoctypeparse, createDefaultPublisher, publish } = require('jsdoctypeparser')
const { createItemLink } = require('./utils')

// const extendedConfig = env.conf.extendedConfig
const buildInJSObjects = env.conf.templates.buildins

const customPublisher = createDefaultPublisher()

function parsers (allDoclets) {
  // todo rewrite through jsdoctypeparse
  const linkParser = href => {
    // if (href === 'class:UBConnection#domain') {
    //   debugger
    // }
    let type, name, anchor
    // if has substring 'module:' two times
    href = href.includes('module:') ? href.substring(href.lastIndexOf('module:')) : href
    // if look like module:... or class:...
    if (/(.*):(.*)/.test(href)) {
      [type, name] = href.match(/[^:]+/g)
      // else trying to find by name in all items
    } else if (allDoclets.filter(({ name }) => name === href).length > 0) {
      const [item] = allDoclets.filter(({ name }) => name === href).sort((a, b) => a.scope === 'global' ? -1 : 1)
      if (item.scope === 'global' || ['module', 'class'].includes(item.kind)) {
        name = href
        type = item.kind
      } else if (item.memberof !== undefined) {
        return linkParser(item.longname, allDoclets)
      }
    } else {
      name = href
    }

    // change Class[.|~]method to Class#method
    name = name.replace(/[.~]/, '#')
    // parse anchor
    if (name.includes('#')) {
      [name, anchor] = name.match(/[^#]+/g)
    }
    return { type, name, anchor }
  }

  const hrefFromType = typeName => {
    // for build-in types - add a link to buildInURL
    if (buildInJSObjects && env.conf.templates.buildInURL) {
      if (buildInJSObjects.includes(typeName.toLowerCase())) {
        return {
          text: typeName,
          link: env.conf.templates.buildInURL + typeName.toLowerCase()
        }
      }
    }
    const { type, name, anchor } = linkParser(typeName)
    return {
      text: anchor || name,
      link: createItemLink(type, name, anchor)
    }
  }

  customPublisher.NAME = (node, pub) => {
    const { text, link } = hrefFromType(node.name)
    return `<a href="${link}">${text}</a>`
  }

  // todo rewrite with #12
  customPublisher.MODULE = (node, pub) => {
    const { text, link } = hrefFromType(`module:${node.value.path}`)
    return `<a href="${link}">${text}</a>`
  }

  const parseType = (typeObj) => {
    if (typeObj === undefined) return undefined
    const { names } = typeObj
    return names.map(typeName => {
      const ast = jsdoctypeparse(typeName)
      return publish(ast, customPublisher)
    })
  }

  const linkReplacer = (__, link) => {
    // if one world => linkText = href
    const [href, linkText = href] = link.match(/\S+/g)
    const { type, name, anchor } = linkParser(href)
    return `<a href="${createItemLink(type, name, anchor)}">${linkText}</a>`
  }
  const replaceAllLinks = text => {
    return (typeof text === 'string') ? text.replace(/{@link (.*?)}/g, linkReplacer) : text
  }

  // replace links types etc
  const prepareDoclets = doclets => {
    // replace all links in doclets
    doclets.forEach(doclet => {
      doclet.readme = doclet.readme ? replaceAllLinks(doclet.readme) : undefined
      doclet.description = doclet.description ? replaceAllLinks(doclet.description) : undefined
      doclet.classdesc = doclet.classdesc ? replaceAllLinks(doclet.classdesc) : undefined
      doclet.deprecated = typeof (doclet.deprecated) === 'string' ? replaceAllLinks(doclet.deprecated) : undefined
      if (doclet.params) {
        doclet.params.forEach(param => {
          param.description = param.description ? replaceAllLinks(param.description) : undefined
        })
      }
    })
    // parse all types and replace it with html string
    doclets.forEach(doclet => {
      // if (doclet.name === 'lock') debugger
      doclet.type = doclet.type ? parseType(doclet.type, allDoclets) : undefined
      if (doclet.returns) {
        doclet.returns[0].type = parseType(doclet.returns[0].type, allDoclets)
      }

      if (doclet.properties) {
        doclet.properties.forEach(property => {
          if (property.___id === undefined) { property.type = parseType(property.type, allDoclets) }
        })
      }
      if (doclet.params) {
        doclet.params.forEach(param => {
          if (param.___id === undefined) { param.type = parseType(param.type, allDoclets) }
        })
      }
    })

    // parse params and grouping subparams
    doclets.forEach(doclet => {
      // if complex parameter like options.encoding in getContent
      if (doclet.params) {
        doclet.paramsForMethods = doclet.params.filter(({ name }) => !name.includes('.'))
        const args = doclet.params.filter(({ name }) => doclet.params.some(({ name: innerName }) => innerName.startsWith(`${name}.`)))
        args.forEach(arg => {
          arg.props = doclet.params.filter(({ name }) => name.startsWith(`${arg.name}.`) && name.split(`${arg.name}.`)[1].indexOf('.') === -1).map(param => ({
            ...param,
            name: param.name.split('.')[param.name.split('.').length - 1]
          }))
        })
        doclet.params = [...args, ...doclet.params.filter(param => param.description && !param.name.includes('.') && !args.includes(param))]
      }
    })

    // // grouping properties
    // allDoclets.forEach(item => {
    //   // if complex parameter like options.encoding in getContent
    //   if (item.properties) {
    //     const arguments = item.properties.filter(({ name }) => item.properties.some(({ name: innerName }) => innerName.includes(`${name}.`)))
    //     arguments.forEach(arg => {
    //       arg.props = item.properties.filter(({ name }) => name.includes(`${arg.name}.`)).map(param => ({
    //         ...param,
    //         name: param.name.match(/\.([^.]+)/)[1]
    //       }))
    //     })
    //     item.properties = [...arguments, ...item.properties.filter(param => param.description && !param.name.includes('.'))]
    //   }
    // })

    // add links for mixin
    doclets.forEach(doclet => {
      if (doclet.mixes) {
        doclet.mixes = doclet.mixes.map(mixinName => {
          const { type, name, anchor } = linkParser(mixinName, allDoclets)
          return {
            text: anchor || name,
            link: createItemLink(type, name, anchor)
          }
        })
      }
    })

    // add link to source code
    doclets.forEach(doclet => {
      if (doclet.meta) {
        const filePath = doclet.meta.path
        const fileName = doclet.meta.filename
        const line = doclet.meta.lineno
        doclet.codeLink = 'source/' + createItemLink('source', path.basename(filePath) + '/' + fileName, 'code.' + line)
      }
    })

    // need for highlight syntax
    doclets.forEach(doclet => {
      doclet.classdesc = doclet.classdesc ? doclet.classdesc.replace(/<pre class="prettyprint source"><code>/g, '<pre class="prettyprint source"><code class="language-javascript">', 'g') : undefined
      doclet.description = doclet.description ? doclet.description.replace(/<pre class="prettyprint source"><code>/g, '<pre class="prettyprint source"><code class="language-javascript">', 'g') : undefined
    })

    return doclets
  }
  return { prepareDoclets, replaceAllLinks }
}

module.exports = parsers
