const _ = require('lodash')
const fs = require('fs')
const path = require('path')

// itemType === 'class' ? `${itemName.replace('/', '_')}.html` is for compatibility with old jsdoc links
const createItemFileName = (itemType, itemName) => itemType === 'class' ? `${itemName.replace('/', '_')}.html` : `${itemType}-${itemName.replace('/', '_')}.html`

const createItemLink = (itemType, itemName, anchor) => {
  const link = anchor ? `${createItemFileName(itemType, itemName)}#${anchor}` : createItemFileName(itemType, itemName)
  return encodeURI(link)
}

const itemTypes = {
  module: {
    name: 'Modules',
    generateName: (moduleName, parentName) => parentName ? `${parentName}.module:${moduleName}` : `module:${moduleName}`
  },
  class: {
    name: 'Classes',
    generateName: (clazzName, parentName) => parentName ? `${parentName}~${clazzName}` : clazzName
  },
  namespace: {
    name: 'Namespaces',
    generateName: namespaceName => namespaceName
  },
  mixin: {
    name: 'Mixins',
    generateName: mixinName => mixinName
  },
  interface: {
    name: 'Interfaces',
    generateName: interfaceName => interfaceName
  }
  // function: {
  // name: 'Global',
  //   generateName: 'Global',
  // }
}

const groupDoclets = doclets => _.groupBy(doclets, 'kind')
const groupRootDoclets = doclets => {
  const rootGroupedItems = {} // Object.keys(groups).map(group => groups[group].filter(({ memberof }) => memberof === undefined))
  for (const [key, value] of Object.entries(groupDoclets(doclets))) {
    rootGroupedItems[key] = value.filter(({ memberof }) => memberof === undefined)
  }
  return rootGroupedItems
}

const copyFiles = (from, to) => {
  fs.readdirSync(from, { withFileTypes: true })
    .filter(item => !item.isDirectory())
    .map(item => item.name)
    .forEach(fileName => {
      fs.copyFileSync(path.resolve(from, fileName), path.resolve(to, fileName))
    })
}
const idGeneratorFabric = prefix => {
  let id = 1
  return () => prefix + (id++)
}

function isVerbose () {
  const myArgs = process.argv.slice(2)
  return myArgs.indexOf('--verbose') !== -1
}
module.exports = {
  createItemLink,
  createItemFileName,
  itemTypes,
  groupDoclets,
  groupRootDoclets,
  copyFiles,
  idGeneratorFabric,
  isVerbose: isVerbose()
}
