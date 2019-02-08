const helper = require('jsdoc/util/templateHelper')
const fs = require('fs')
const path = require('path')
const env = require('jsdoc/env')
const vueRender = require('vue-server-renderer')
const _ = require('lodash')
const jsdoctypeparse = require('jsdoctypeparser').parse
const lunr = require('lunr')
const md = require('markdown-it')()
exports.publish = function (taffyData, opts, tutorials) {
  let data = taffyData
  debugger
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
  const outdir = path.normalize(env.opts.destination)
  // for node >= 10
  fs.mkdirSync(outdir, { recursive: true })
  // fs.writeFileSync('/home/andrey/dev/ub-jsdoc/data', JSON.stringify(data().get(), null, 2))
  data = helper.prune(data)
  data.sort('longname, version, since')
  const allData = data().get()
  console.log(outdir)

  // fs.writeFileSync('/home/andrey/dev/ub-jsdoc/alldata', JSON.stringify(allData, null, 2))

  const Vue = require('vue')

  Vue.component('func', {
    props: ['func'],
    template: fs.readFileSync(path.resolve(__dirname, 'tmpl/elements/func.vue'), 'utf-8')
  })
  Vue.component('member', {
    props: ['member'],
    template: fs.readFileSync(path.resolve(__dirname, 'tmpl/elements/member.vue'), 'utf-8')
  })
  Vue.component('type', {
    props: ['type'],
    template: fs.readFileSync(path.resolve(__dirname, 'tmpl/elements/type.vue'), 'utf-8')
  })
  Vue.component('event', {
    props: ['event'],
    template: fs.readFileSync(path.resolve(__dirname, 'tmpl/elements/event.vue'), 'utf-8')
  })
  Vue.component('example', {
    props: ['example'],
    template: fs.readFileSync(path.resolve(__dirname, 'tmpl/elements/example.vue'), 'utf-8')
  })
  Vue.component('sidebar', {
    props: ['navigation'],
    template: fs.readFileSync(path.resolve(__dirname, 'tmpl/elements/sidebar.vue'), 'utf-8')
  })
  Vue.component('t-o-content', {
    props: ['tableOfContent'],
    template: fs.readFileSync(path.resolve(__dirname, 'tmpl/elements/t-o-content.vue'), 'utf-8')
  })

  const render = (data, vueTemplPath, htmlTemplPath, outputPath) => {
    const app = new Vue({
      data,
      template: fs.readFileSync(vueTemplPath, 'utf-8')
    })

    const renderer = vueRender.createRenderer({
      template: fs.readFileSync(htmlTemplPath, 'utf-8')
    })

    renderer.renderToString(app).then(html => {
      fs.writeFileSync(outputPath, html)
    }).catch(err => {
      console.error(err)
    })
  }

  const itemTypes = {
    module: {
      name: 'Modules',
      generateName: (moduleName, parentName) => parentName ? `${parentName}.module:${moduleName}` : `module:${moduleName}`
    },
    class: {
      name: 'Classes',
      generateName: (clazzName, parentName) => parentName ? `${parentName}~${clazzName}` : clazzName,
    },
    namespace: {
      name: 'Namespaces',
      generateName: namespaceName => namespaceName,
    },
    mixin: {
      name: 'Mixins',
      generateName: mixinName => mixinName,
    },
    interface: {
      name: 'Interfaces',
      generateName: interfaceName => interfaceName
    },
    // function: {
    // name: 'Global',
    //   generateName: 'Global',
    // }
  }

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
    } else if (allData.filter(({ name }) => name === href).length > 0) {
      const [item] = allData.filter(({ name }) => name === href).sort((a, b) => a.scope === 'global' ? -1 : 1)
      if (item.scope === 'global' || ['module', 'class'].includes(item.kind)) {
        name = href
        type = item.kind
      } else if (item.memberof !== undefined) {
        return linkParser(item.longname)
      }
    } else {
      name = href
      // type = 'class'
      //   [type, name] = parent.match(/[^:]+/g)
      //   anchor = href
      //   // type = 'class'
      //   // name = href
      //   // const [item] = allData.filter((item => item.name === href))
      //   // type = 'module'
      //   // name = item.longname.match(/\.module:(.*)[#~.]/g)[1]
      //   // anchor = item.name
      //   // search name in all items for full info
      //   // const [item] = allData.filter((item => item.name === linkText));
      //   //
      //   // if (!item){
      //   //   type = 'class'
      //   //   name = href
      //   // } else {
      //   //   // [name, anchor] = item.name.match(/.module:(.*)~(.*)/g)
      //   //   name = item.
      //   // }
    }

    // change Class[.|~]method to Class#method
    name = name.replace(/[.~]/, '#')
    // parse anchor
    if (name.includes('#')) {
      [name, anchor] = name.match(/[^#]+/g)
    }
    return { type, name, anchor }
  }

// return text
  const linkReplacer = (_, link) => {
    //       if one world => linkText = href
    const [href, linkText = href] = link.match(/\S+/g)
    const { type, name, anchor } = linkParser(href)
    return `<a href="${createItemLink(type, name, anchor)}">${linkText}</a>`
  }
  const replaceAllLinks = text => {
    return text.replace(/{@link (.*?)}/g, linkReplacer)
  }

  const createItemFileName = (itemType, itemName) => `${itemType}-${itemName.replace('/', '%')}.html`
  const createItemLink = (itemType, itemName, anchor) => {
    const link = anchor ? `${createItemFileName(itemType, itemName)}#${anchor}` : createItemFileName(itemType, itemName)
    return encodeURI(link)
  }
  const filterGroupByMemberOf = (groupedItems, memberName) => groupedItems.filter(({ memberof }) => memberof === memberName)

  const parseType = (typeObj) => {
    const buildInJSObjects = {
      object: {
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object'
      },
      boolean: {
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean'
      },
      number: {
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number'
      },
      string: {
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String'
      },
      array: {
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array'
      },
      arraybuffer: {
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer'
      },
      null: {
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null'
      },
      function: {
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function'
      },
      undefined: {
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined'
      },
      '*': {
        link: ''
      }
    }
    if (typeObj === undefined) return undefined
    const { names } = typeObj
    return names.map(typeName => {
      const parsedType = jsdoctypeparse(typeName)
      if (parsedType.type === 'NAME') {
        typeName = parsedType.name
      }
      //if standard js type
      if (Object.keys(buildInJSObjects).includes(typeName.toLowerCase())) {
        return {
          text: typeName,
          link: buildInJSObjects[typeName.toLowerCase()].link
        }
      }
      const { type, name, anchor } = linkParser(typeName)
      return {
        text: anchor ? anchor : name,
        link: createItemLink(type, name, anchor)
      }
    })
  }

  // replace all links in data
  allData.forEach(item => {
    item.readme = item.readme ? replaceAllLinks(item.readme) : undefined
    item.description = item.description ? replaceAllLinks(item.description) : undefined
    item.classdesc = item.classdesc ? replaceAllLinks(item.classdesc) : undefined
    item.deprecated = typeof (item.deprecated) === 'string' ? replaceAllLinks(item.deprecated) : undefined
    if (item.params) item.params.forEach(param => {
      param.description = param.description ? replaceAllLinks(param.description) : undefined
    })
  })
  // parse and replace with {text:..., link:...}  all types
  allData.forEach(item => {
    // if (item.name === 'serverConfig') debugger
    item.type = item.type ? parseType(item.type, item.name) : undefined
    item.returns = item.returns ? parseType(item.returns[0].type) : undefined

    if (item.properties) {
      item.properties.forEach(property => {
        if (property.___id === undefined)
          property.type = parseType(property.type, property.name)
      })
    }
    if (item.params) {
      item.params.forEach(param => {
        if (param.___id === undefined)
          param.type = parseType(param.type)
      })
    }
  })

  // parse params and grouping subparams
  allData.forEach(item => {
    // if complex parameter like options.encoding in getContent
    if (item.params) {
      item.paramsForMethods = item.params.filter(({ name }) => !name.includes('.'))
      const arguments = item.params.filter(({ name }) => item.params.some(({ name: innerName }) => innerName.includes(`${name}.`)))
      arguments.forEach(arg => {
        arg.props = item.params.filter(({ name }) => name.includes(`${arg.name}.`)).map(param => ({
          ...param,
          name: param.name.match(/\.([^.]+)/)[1]
        }))
      })
      item.params = [...arguments, ...item.params.filter(param => param.description && !param.name.includes('.'))]
    }
  })

  // // grouping properties
  // allData.forEach(item => {
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

  //add links for mixin
  allData.forEach(item => {
    if (item.mixes) {
      item.mixes = item.mixes.map(mixinName => {
        const { type, name, anchor } = linkParser(mixinName)
        return {
          text: anchor ? anchor : name,
          link: createItemLink(type, name, anchor)
        }
      })
    }
  })

  //need for highlight syntax in class
  allData.forEach(item => {
    item.classdesc = item.classdesc ? item.classdesc.replace(/<pre class="prettyprint source"><code>/g, '<pre class="prettyprint source"><code class="language-javascript">', 'g') : undefined
    item.description = item.description ? item.description.replace(/<pre class="prettyprint source"><code>/g, '<pre class="prettyprint source"><code class="language-javascript">', 'g') : undefined
  })

  // const funcsWithParams = funcs
  // // for params in parentheses in methods
  //   .map(func =>
  //     (func.params ? {
  //       ...func,
  //       paramsForMethods: func.params
  //       // if complex parameter like options.encoding in getContent
  //         .filter(({ name }) => !name.includes('.'))
  //     } : func))
  // funcsWithParams.forEach(func => {
  //   if (func.params) {
  //     const arguments = func.params.filter(({ name }) => func.params.some(({ name: innerName }) => innerName.includes(`${name}.`)))
  //     arguments.forEach(arg => {
  //       arg.props = func.params.filter(({ name }) => name.includes(`${arg.name}.`)).map(param => ({
  //         ...param,
  //         name: param.name.match(/\.([^.]+)/)[1]
  //       }))
  //     })
  //     func.params = [...arguments, ...func.params.filter(param => param.description && !param.name.includes('.'))]
  //   }
  // })
  // if (item.properties) {
  //   item.properties.forEach(properties => {
  //     properties.type = parseType(properties.type,properties.name)
  //   })
  // }
  // if (item.params) {
  //   item.params.forEach(params => {
  //     params.type = parseType(params.type, params.name)
  //   })
  // }
  // parse and replace with {text:..., link:...} | undefined  all types
  // allData.forEach(item => {
  //   item.type = item.type ? parseType(item.type) : undefined
  //   if (item.properties) {
  //     item.properties.forEach(properties => {
  //       properties.type = parseType(properties.type)
  //     })
  //   }
  //   if (item.params) {
  //     item.params.forEach(params => {
  //       params.type = parseType(params.type)
  //     })
  //   }
  //   item.returns = item.returns ? parseType(item.returns[0].type) : undefined
  // })

  const groupedItems = _.groupBy(allData, 'kind')
  const rootGroupedItems = {} //Object.keys(groups).map(group => groups[group].filter(({ memberof }) => memberof === undefined))
  for (let [key, value] of Object.entries(groupedItems)) {
    rootGroupedItems[key] = value.filter(({ memberof }) => memberof === undefined)
  }

  const createNavigation = (currentType, currentItem) => {
    return Object.keys(itemTypes).filter(type => rootGroupedItems[type] && rootGroupedItems[type][0]).map(type => ({
      name: itemTypes[type].name,
      link: createItemLink(type, rootGroupedItems[type][0].name),
      // submenu present only for current type
      submenu: type === currentType ? _.uniqBy(rootGroupedItems[type], 'name').map(item => ({
        link: createItemLink(item.kind, item.name),
        name: item.name,
        isCurrent: item.name === currentItem
      })) : undefined
    }))
  }

  /// index page
  const indexNavigation = Object.keys(itemTypes).filter(type => rootGroupedItems[type] && rootGroupedItems[type][0]).map(type => ({
    name: itemTypes[type].name,
    link: createItemLink(type, rootGroupedItems[type][0].name)
  }))
  render({
      readme: replaceAllLinks(opts.readme),
      navigation: indexNavigation,
      contents: []
    },
    path.resolve(__dirname, 'tmpl/index.vue'),
    path.resolve(__dirname, 'tmpl/index.html'),
    path.resolve(outdir, 'index.html'))

  const renderType = (type) => {
    const renderItem = (item, parent) => {
      // if (item.name === 'uba_prevPasswordsHash_ns') debugger
      const itemName = itemTypes[item.kind].generateName(item.name, parent ? parent.name : undefined)
      item.breadcrumbs = [...parent ? parent.breadcrumbs : [], {
        name: item.name,
        link: createItemLink(item.kind, item.name)
      }]
      const subclasses = filterGroupByMemberOf(groupedItems.class, itemName)
      subclasses.forEach(clazz => {
        clazz.link = createItemLink(clazz.kind, clazz.name)
        renderItem(clazz, {
          name: itemName,
          kind: item.kind,
          breadcrumbs: item.breadcrumbs
        })
      })

      const submodules = filterGroupByMemberOf(groupedItems.module, itemName)
      submodules.forEach(submodule => {
        submodule.link = createItemLink(submodule.kind, submodule.name)
        renderItem(submodule, {
          name: itemName,
          kind: item.kind,
          breadcrumbs: item.breadcrumbs
        })
      })

      const mixins = filterGroupByMemberOf(groupedItems.mixin, itemName)
      mixins.forEach(mixin => {
        mixin.link = createItemLink(mixin.kind, mixin.name)
        renderItem(mixin, {
          name: itemName,
          kind: item.kind,
          breadcrumbs: item.breadcrumbs
        })
      })

      const members = filterGroupByMemberOf(groupedItems.member, itemName)

      const funcs = filterGroupByMemberOf(groupedItems.function, itemName)

      const types = filterGroupByMemberOf(groupedItems.typedef, itemName)

      const events = filterGroupByMemberOf(groupedItems.event, itemName)

      const tableOfContent = [
        {
          name: 'Members',
          props: members.map(member => ({
            name: member.name
          }))
        },
        {
          name: 'Methods',
          props: funcs.map(func => ({
            name: func.name
          }))
        },
        {
          name: 'Types',
          props: types.map(type => ({
            name: type.name
          }))
        },
        {
          name: 'Events',
          props: events.map(event => ({
            name: event.name
          }))
        }
      ]

      render({
          navigation: createNavigation(item.kind, item.name),
          [item.kind === 'class' ? 'clazz' : item.kind]: item,
          subclasses,
          submodules,
          mixins,
          members,
          funcs,
          types,
          events,
          tableOfContent
        },
        path.resolve(__dirname, `tmpl/${item.kind}.vue`),
        path.resolve(__dirname, 'tmpl/index.html'),
        path.resolve(outdir, createItemFileName(item.kind, item.name)))
    }
    if (rootGroupedItems[type]) {
      rootGroupedItems[type].forEach(item => renderItem(item))
    }
  }
  // todo itemTypes iterate
  renderType('module')
  renderType('class')
  renderType('namespace')
  renderType('mixin')
  renderType('interface')

  const idGeneratorFabric = prefix => {
    let id = 1
    return () => prefix + (id++)
  }

  // let getNavID = idGeneratorFabric('n')
  let getFTSid = idGeneratorFabric('f')

  let ftsData = {}

  const ftsIndex = lunr(function () {
    const addToSearch = (item, parent, link) => {
      const id = getFTSid()

      this.add({
        id: id,
        name: item.name,
        description: item.readme ? item.readme.replace(/<.*?>/g, ' ') : undefined || item.classdesc ? item.classdesc.replace(/<.*?>/g, ' ') : undefined || item.description ? item.description.replace(/<.*?>/g, ' ') : undefined || item.content /* for tutorials */
      })
      ftsData[id] = {
        link,
        // path: item.longname,
        kind: item.kind,
        name: item.name,
        parent: parent || item.name
      }
    }

    this.ref('id')
    this.field('name', { boost: 5 })
    this.field('description', { boost: 1 })

    Object.keys(itemTypes).map(type => {
      const renderItem = (item, parent) => {
        if (item.name === '@unitybase/uba') debugger
        const itemName = itemTypes[item.kind].generateName(item.name, parent ? parent.name : undefined)

        item.breadcrumbs = [...parent ? parent.breadcrumbs : [], {
          name: item.name,
          link: createItemLink(item.kind, item.name)
        }]
        addToSearch(item, parent ? parent.name : undefined, createItemLink(item.kind, item.name))

        const subclasses = filterGroupByMemberOf(groupedItems.class, itemName)
        subclasses.forEach(clazz => {
          clazz.link = createItemLink(clazz.kind, clazz.name)
          renderItem(clazz, {
            name: itemName,
            kind: item.kind,
            breadcrumbs: item.breadcrumbs
          })
        })

        const submodules = filterGroupByMemberOf(groupedItems.module, itemName)
        submodules.forEach(submodule => {
          submodule.link = createItemLink(submodule.kind, submodule.name)
          renderItem(submodule, {
            name: itemName,
            kind: item.kind,
            breadcrumbs: item.breadcrumbs
          })
        })

        const mixins = filterGroupByMemberOf(groupedItems.mixin, itemName)
        mixins.forEach(mixin => {
          mixin.link = createItemLink(mixin.kind, mixin.name)
          renderItem(mixin, {
            name: itemName,
            kind: item.kind,
            breadcrumbs: item.breadcrumbs
          })
        })

        const members = filterGroupByMemberOf(groupedItems.member, itemName)
        members.forEach(member => {
          addToSearch(member, item.name, createItemLink(item.kind, item.name, member.name))
        })
        const funcs = filterGroupByMemberOf(groupedItems.function, itemName)
        funcs.forEach(func => {
          addToSearch(func, item.name, createItemLink(item.kind, item.name, func.name))
        })
        const types = filterGroupByMemberOf(groupedItems.typedef, itemName)
        types.forEach(type => {
          addToSearch(type, item.name, createItemLink(item.kind, item.name, type.name))
        })
        const events = filterGroupByMemberOf(groupedItems.event, itemName)
        events.forEach(event => {
          addToSearch(event, item.name, createItemLink(item.kind, item.name, event.name))
        })
      }
      if (rootGroupedItems[type]) {
        rootGroupedItems[type].forEach(item => renderItem(item))
      }
    })
  })

  fs.writeFileSync(path.resolve(outdir, 'ftsIndex.json'), JSON.stringify(ftsIndex))
  fs.writeFileSync(path.resolve(outdir, 'ftsData.json'), JSON.stringify(ftsData))

  const staticPath = path.resolve(opts.template, 'static')
  const copyFiles = (from, to) => {
    fs.readdirSync(from, { withFileTypes: true })
      .filter(item => !item.isDirectory())
      .map(item => item.name)
      .forEach(fileName => {
        fs.copyFileSync(path.resolve(from, fileName), path.resolve(to, fileName))
      })
  }

  copyFiles(path.resolve(staticPath, 'styles'), outdir)
  copyFiles(path.resolve(staticPath, 'scripts'), outdir)

  // tutorials
  debugger
  if (tutorials.children.length > 0) {
    // navigation
    // todo navigation for tutor


    fs.mkdirSync(path.resolve(outdir, '../tutorials'))
    copyFiles(path.resolve(staticPath, 'styles'), path.resolve(outdir, '../tutorials'))
    copyFiles(path.resolve(staticPath, 'scripts'), path.resolve(outdir, '../tutorials'))
    const renderTutorial = tutorial => {
      const html = md.render(tutorial.content)

      render({
          html
        },
        path.resolve(__dirname, 'tmpl/tutorial.vue'),
        path.resolve(__dirname, 'tmpl/index.html'),
        path.resolve(outdir, '../tutorials', createItemFileName('tutorial', tutorial.name))
      )
      tutorial.children.forEach(renderTutorial)
    }
    tutorials.children.forEach(renderTutorial)
  }

  // renderType('function', functionName => functionName)
  //render global
  // const renderGlobal = () => {
  //   debugger
  //   const globalItems = allData.filter(({ scope, kind }) => scope === 'global' && ['member', 'function'].includes(kind))
  //
  // }
  //
  // renderGlobal()
}

//   const renderClass = (clazz, parent) => {
//     const className = parent ? `${parent}~${clazz.name}` : clazz.name
//     const members = filterGroupByMemberOf(groupedItems.member, className)
//     const funcs = filterGroupByMemberOf(groupedItems.function, className)
//     const tableOfContent = [
//       {
//         name: 'Members',
//         props: members.map(member => ({
//           name: member.name
//         }))
//       },
//       {
//         name: 'Methods',
//         props: funcs.map(func => ({
//           name: func.name
//         }))
//       }
//     ]
//
//     clazz.classdesc = clazz.classdesc ? replaceAllLinks(clazz.classdesc) : undefined
//     const membersWithLinks = members.map(member =>
//       (member.description ? {
//         ...member,
//         description: replaceAllLinks(member.description)
//       } : member))
//
//     const funcsWithLinks = funcs
//       .map(func =>
//         (func.deprecated ? {
//           ...func,
//           deprecated: replaceAllLinks(func.deprecated)
//         } : func))
//       .map(func =>
//         (func.description ? {
//           ...func,
//           description: replaceAllLinks(func.description)
//         } : func))
//
// //     const classNavigation = classes.map(clazz => ({
// //       link: createItemLink(clazz.kind, clazz.name),
// //       name: clazz.name,
// //       isCurrent: clazz.name === className
// //     }))
// // debugger
//     render({
//         navigation: createNavigation('class', clazz.name),
//         clazz,
//         members: membersWithLinks,
//         funcs: funcsWithLinks,
//         tableOfContent
//       },
//       '/home/andrey/dev/ub-jsdoc/tmpl/class.vue',
//       '/home/andrey/dev/ub-jsdoc/index.html',
//       `/home/andrey/dev/ub-jsdoc/renders/${createItemFileName(clazz.kind, clazz.name)}`)
//   }
//   rootGroupedItems.class.forEach(clazz => renderClass(clazz))
//
//   // modules
//
//   const renderModule = (module, parent) => {
//     const moduleName = parent ? `${parent}.module:${module.name}` : `module:${module.name}`
//
//     module.readme = module.readme ? replaceAllLinks(module.readme) : undefined
//     module.description = module.description ? replaceAllLinks(module.description) : undefined
//     const subclasses = filterGroupByMemberOf(groupedItems.class, moduleName)
//     subclasses.forEach(clazz => clazz.link = createItemLink(clazz.kind, clazz.name))
//     subclasses.forEach(clazz => renderClass(clazz, moduleName))
//
//     const submodules = filterGroupByMemberOf(groupedItems.module, moduleName)
//     submodules.forEach(submodule => submodule.link = createItemLink(submodule.kind, submodule.name))
//     // render submodules. maybe better move from renderModule to up?
//     submodules.forEach(submodule => renderModule(submodule, moduleName))
//
//     const members = filterGroupByMemberOf(groupedItems.member, moduleName)
//
//     const funcs = filterGroupByMemberOf(groupedItems.function, moduleName)
//
//     const types = filterGroupByMemberOf(groupedItems.typedef, moduleName)
//
//     const tableOfContent = [
//       {
//         name: 'Members',
//         props: members.map(member => ({
//           name: member.name
//         }))
//       },
//       {
//         name: 'Methods',
//         props: funcs.map(func => ({
//           name: func.name
//         }))
//       },
//       {
//         name: 'Types',
//         props: types.map(type => ({
//           name: type.name
//         }))
//       }
//     ]
//
//     const memberWithLinks = members.map(member =>
//       (member.description ? {
//         ...member,
//         description: replaceAllLinks(member.description)
//       } : member))
//
//     // const moduleNavigation = modules.map(navModule => ({
//     //   link: createItemLink(navModule.kind, navModule.name),
//     //   name: navModule.name,
//     //   isCurrent: navModule.name === module.name
//     // }))
//
//     render({
//         navigation: createNavigation('module', module.name),
//         module,
//         subclasses,
//         submodules,
//         members: memberWithLinks,
//         funcs,
//         types,
//         tableOfContent
//       },
//       '/home/andrey/dev/ub-jsdoc/tmpl/module.vue',
//       '/home/andrey/dev/ub-jsdoc/index.html',
//       `/home/andrey/dev/ub-jsdoc/renders/${createItemFileName(module.kind, module.name)}`)
//   }
//   rootGroupedItems.module.forEach(module => renderModule(module))
//
//   // namespaces
//
//   const renderNamespace = (namespace) => {
//     const namespaceName = namespace.name
//
//     namespace.readme = namespace.readme ? replaceAllLinks(namespace.readme) : undefined
//     namespace.description = namespace.description ? replaceAllLinks(namespace.description) : undefined
//
//     const members = filterGroupByMemberOf(groupedItems.member, namespaceName)
//
//     const funcs = filterGroupByMemberOf(groupedItems.function, namespaceName)
//
//     const types = filterGroupByMemberOf(groupedItems.typedef, namespaceName)
//
//     const events = filterGroupByMemberOf(groupedItems.event, namespaceName)
//     const tableOfContent = [
//       {
//         name: 'Members',
//         props: members.map(member => ({
//           name: member.name
//         }))
//       },
//       {
//         name: 'Methods',
//         props: funcs.map(func => ({
//           name: func.name
//         }))
//       },
//       {
//         name: 'Types',
//         props: types.map(type => ({
//           name: type.name
//         }))
//       },
//       {
//         name: 'Events',
//         props: events.map(event => ({
//           name: event.name
//         }))
//       }
//     ]
//
//     const memberWithLinks = members.map(member =>
//       (member.description ? {
//         ...member,
//         description: replaceAllLinks(member.description)
//       } : member))
//
//     // const namespaceNavigation = namespaces.map(navNamespace => ({
//     //   link: createItemLink(navNamespace.kind, navNamespace.name),
//     //   name: navNamespace.name,
//     //   isCurrent: navNamespace.name === namespace.name
//     // }))
//
//     render({
//         navigation: createNavigation('namespace', namespace.name),
//         namespace,
//         members: memberWithLinks,
//         funcs,
//         types,
//         events,
//         tableOfContent
//       },
//       '/home/andrey/dev/ub-jsdoc/tmpl/namespace.vue',
//       '/home/andrey/dev/ub-jsdoc/index.html',
//       `/home/andrey/dev/ub-jsdoc/renders/${createItemFileName(namespace.kind, namespace.name)}`)
//   }
//   rootGroupedItems.namespace.forEach(namespace => renderNamespace(namespace))
