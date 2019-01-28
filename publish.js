const helper = require('jsdoc/util/templateHelper')
const fs = require('fs')
const vueRender = require('vue-server-renderer')
const _ = require('lodash')
exports.publish = function (taffyData, opts, tutorials) {
  let data = taffyData

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

  // fs.writeFileSync('/home/andrey/dev/ub-jsdoc/data', JSON.stringify(data().get(), null, 2))
  data = helper.prune(data)
  data.sort('longname, version, since')
  const allData = data().get()

  // fs.writeFileSync('/home/andrey/dev/ub-jsdoc/alldata', JSON.stringify(allData, null, 2))

  const Vue = require('vue')

  Vue.component('func', {
    props: ['func'],
    template: fs.readFileSync('/home/andrey/dev/ub-jsdoc/tmpl/elements/func.vue', 'utf-8')
  })
  Vue.component('member', {
    props: ['member'],
    template: fs.readFileSync('/home/andrey/dev/ub-jsdoc/tmpl/elements/member.vue', 'utf-8')
  })
  Vue.component('type', {
    props: ['type'],
    template: fs.readFileSync('/home/andrey/dev/ub-jsdoc/tmpl/elements/type.vue', 'utf-8')
  })
  Vue.component('event', {
    props: ['event'],
    template: fs.readFileSync('/home/andrey/dev/ub-jsdoc/tmpl/elements/event.vue', 'utf-8')
  })
  Vue.component('example', {
    props: ['example'],
    template: fs.readFileSync('/home/andrey/dev/ub-jsdoc/tmpl/elements/example.vue', 'utf-8')
  })
  Vue.component('sidebar', {
    props: ['navigation'],
    template: fs.readFileSync('/home/andrey/dev/ub-jsdoc/tmpl/elements/sidebar.vue', 'utf-8')
  })
  Vue.component('t-o-content', {
    props: ['tableOfContent'],
    template: fs.readFileSync('/home/andrey/dev/ub-jsdoc/tmpl/elements/t-o-content.vue', 'utf-8')
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

  const linkParser = href => {
    if (href === 'Worker') {
      debugger
    }
    let type, name, anchor
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
    name = name.replace(/\.|~/, '#')
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

  const groupedItems = _.groupBy(allData, 'kind')

  /// index page
  const rootGroupedItems = {} //Object.keys(groups).map(group => groups[group].filter(({ memberof }) => memberof === undefined))
  for (let [key, value] of Object.entries(groupedItems)) {
    rootGroupedItems[key] = value.filter(({ memberof }) => memberof === undefined)
  }

  const navigation = {
    module: {
      name: 'Modules'
    },
    class: {
      name: 'Classes',
    },
    namespace: {
      name: 'Namespaces',
    },
    mixin: {
      name: 'Mixins',
    },
    interface: {
      name: 'Interfaces'
    },
    function: {
      name: 'Global',
    }
  }
  debugger
  const createNavigation = (currentType, currentItem) => {

    // const classes = rootGroupedItems.class
    // const classNavigation = classes.map(clazz => ({
    //   link: createItemLink(clazz.kind, clazz.name),
    //   name: clazz.name,
    //   isCurrent: clazz.name === className
    // }))
    //
    // mixins.forEach(({ property, value }) => {
    //   navigation[property] = value
    // })

    return Object.keys(navigation).map(type => ({
      name: navigation[type].name,
      link: createItemLink(type, rootGroupedItems[type][0].name),
      // submenu present only render same type
      submenu: type === currentType ? rootGroupedItems[type].map(item => ({
        link: createItemLink(item.kind, item.name),
        name: item.name,
        isCurrent: item.name === currentItem
      })) : undefined
    }))
  }
  const createItemFileName = (itemType, itemName) => `${itemType}-${itemName.replace('/', '%')}.html`
  const createItemLink = (itemType, itemName, anchor) => {
    const link = anchor ? `${createItemFileName(itemType, itemName)}#${anchor}` : createItemFileName(itemType, itemName)
    return encodeURI(link)
  }
  const indexNavigation = Object.keys(navigation).map(type => ({
    name: navigation[type].name,
    link: createItemLink(type, rootGroupedItems[type][0].name)
  }))

  // const indexNavigation = navigation.map(({ name, type }) => ({
  //   name,
  //   link: createItemLink(type, rootGroupedItems[type][0].name)
  // }))

  render({
      readme: replaceAllLinks(opts.readme),
      navigation: indexNavigation,
      contents: {}
    },
    '/home/andrey/dev/ub-jsdoc/tmpl/index.vue',
    '/home/andrey/dev/ub-jsdoc/index.html',
    '/home/andrey/dev/ub-jsdoc/renders/index.html')

  const parseType = typeObj => {
    const { names } = typeObj
    return names.map(typeName => {
      const { type, name, anchor } = linkParser(typeName)
      return {
        text: name,
        href: createItemLink(type, name, anchor)
      }
    })
  }

  const filterGroupByMemberOf = (groupedItems, memberName) => groupedItems.filter(({ memberof }) => memberof === memberName)
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
  const renderType = (type, generateName) => {
    const renderItem = (item, parent) => {
      const itemName = generateName(item.name, parent ? parent.name : undefined)
      // const moduleName = parent ? `${parent}.module:${module.name}` : `module:${module.name}`
      item.breadcrumbs = [...parent ? parent.breadcrumbs : [], {
        name: item.name,
        link: createItemLink(item.kind, item.name)
      }]
      item.readme = item.readme ? replaceAllLinks(item.readme) : undefined
      item.description = item.description ? replaceAllLinks(item.description) : undefined
      item.classdesc = item.classdesc ? replaceAllLinks(item.classdesc).replace('<pre class="prettyprint source"><code>', '<pre class="prettyprint source"><code class="language-javascript">') : undefined
      const subclasses = filterGroupByMemberOf(groupedItems.class, itemName)
      subclasses.forEach(clazz => clazz.link = createItemLink(clazz.kind, clazz.name))

      subclasses.forEach(clazz => renderItem(clazz, {
        name: itemName,
        kind: item.kind,
        breadcrumbs: item.breadcrumbs
      }))

      const submodules = filterGroupByMemberOf(groupedItems.module, itemName)
      submodules.forEach(submodule => submodule.link = createItemLink(submodule.kind, submodule.name))
      // render submodules. maybe better move from renderModule to up?
      submodules.forEach(submodule => renderItem(submodule, {
        name: itemName,
        kind: item.kind,
        breadcrumbs: item.breadcrumbs
      }))

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
      const memberWithLinks = members
        .map(member =>
          (member.description ? {
            ...member,
            description: replaceAllLinks(member.description)
          } : member))
        .map(member =>
          (member.type ? {
            ...member,
            type: parseType(member.type)
          } : member))
      const funcsWithLinks = funcs
        .map(func =>
          (func.deprecated ? {
            ...func,
            deprecated: replaceAllLinks(func.deprecated)
          } : func))
        .map(func =>
          (func.description ? {
            ...func,
            description: replaceAllLinks(func.description)
          } : func))
      render({
          navigation: createNavigation(type, item.name),
          [type === 'class' ? 'clazz' : type]: item,
          subclasses,
          submodules,
          members: memberWithLinks,
          funcs: funcsWithLinks,
          types,
          events,
          tableOfContent
        },
        `/home/andrey/dev/ub-jsdoc/tmpl/${type}.vue`,
        '/home/andrey/dev/ub-jsdoc/index.html',
        `/home/andrey/dev/ub-jsdoc/renders/${createItemFileName(item.kind, item.name)}`)
    }
    rootGroupedItems[type].forEach(item => renderItem(item))
  }
  debugger
  renderType('class', (clazzName, parentName) => parentName ? `${parentName}~${clazzName}` : clazzName)
  debugger
  renderType('module', (moduleName, parentName) => parentName ? `${parentName}.module:${moduleName}` : `module:${moduleName}`)
  renderType('namespace', namespaceName => namespaceName)
  renderType('mixin', mixinName => mixinName)
  renderType('interface', interfaceName => interfaceName)

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
