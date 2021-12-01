const fs = require('fs')
const glob = require('glob')
const path = require('path')
const Mustache = require('mustache')

const parseChangelog = require('./parser.js')

/**
 * @typedef {Object} ParsedChangelog - object with parsed changelog. Main info in `versions`
 * @property {string} name - name of package which changelog belong to
 * @property {string} link - any link to package which changelog belong to
 * @property {Array.<Version>} versions - parsed changes grouped by package version
 * @property {Array.<string>} parseErrors - errors witch happen while parse changelog in string format
 */
/**
 * @typedef {Object} Version - object with parsed log to changes in some version. Main info in `parsed`
 * @property {string} version - version of package which log belong to in semver format
 * @property {string} title - title of log, possibly with version and date (like ## [1.0.10] - 2018-09-26)
 * @property {string} date - date of publish in yyyy-mm-dd format
 * @property {string} body - unparsed body of log (### Added ... ### Changed ...)
 * @property {Object} parsed - grouped by types changes
 */
/**
 * @typedef {Object} GroupedChangelog - object with parsed changelog, with few versions, but grouped by changes
 * @property {string} name - name of package which changelog belong to
 * @property {string} link - any link to package which changelog belong to
 * @property {Array.<GroupedChangelogItem>} changes - parsed changes grouped by package version
 */
/**
 * @typedef {Object} GroupedChangelogItem
 * @property {string} type - one of Added|Changed|Deprecated|Removed|Fixed|Security
 * @property {Array.<VersionWithOneTypeOfChanges>} versions
 */
/**
 * @typedef {Object} VersionWithOneTypeOfChanges - object with parsed log to changes in some version.
 * Difference from `Version` is that `VersionForGroupedByChanges` contain log only for one type of changes ('Added', 'Changed'...)
 * @property {string} version - version of package which log belong to in semver format
 * @property {string} date - date of publish in yyyy-mm-dd format
 * @property {Array.<string>} log - text of changes (only one type of changes ('Added', 'Changed'...))
 */

/**
 * Get paths to CHANGELOG.md directly inside provided paths or
 * in one level depth (and only one) sub-folder
 * @param {Array.<string>} includePaths
 * @param {Array.<string>} excludePaths
 * @returns {Array.<string>}
 */
const getChangelogPaths = (includePaths = ['.'], excludePaths = []) =>
  includePaths
    .map(path => `${path}{/*/,/}CHANGELOG.md`)
    // replace next two lines with ".flatMap(pattern => glob.sync(pattern))" when ES2019 flatMap will become widely used
    // https://node.green/#ES2019-features-Array-prototype--flat--flatMap-
    .map(pattern => Array.from(glob.sync(pattern, { ignore: excludePaths })))
    .reduce((acc, paths) => acc.concat(paths))

/**
 * Parse all changelogs by their path's
 * @param {Array.<string>} pathsToChangelogs
 * @returns {Array.<ParsedChangelog>}
 */
const getParsedChangelogs = pathsToChangelogs =>
  pathsToChangelogs.map(filePath => {
    const { name, repository: link } = getPackageInfo(path.dirname(filePath))
    const { versions, parseErrors } = parseChangelog(filePath)
    return { name, link, versions, parseErrors }
  })
/**
 * Generate human-readable report with errors that occurred during parsing changelogs
 * return '' if no one error happen
 * @param {Array.<ParsedChangelog>} parsedChangelogs
 * @returns {string}
 */
const getParseErrors = parsedChangelogs =>
  parsedChangelogs
    .filter(({ parseErrors }) => parseErrors.length > 0)
    .map(({ name, parseErrors }) => {
      return `Problem(s) with parsing ${name}:` +
        parseErrors.join('\n')
    })
    .join('\n\n\n')

/**
 * Filter package versions by date range. For 'toDate' comparison is not strict.
 * @param {ParsedChangelog} changelog - parsed changelog
 * @param {Date} fromDate - older date. If not set supposed to get log from first entry
 * @param {Date} toDate - newer date. If not set supposed to get to last entry. Comparison is not strict
 * @returns {ParsedChangelog}
 */
const filterLogByDate = (changelog, fromDate = new Date(1970, 1, 1), toDate = new Date()) => {
  const versions = changelog.versions.filter(({ date: stringDate }) => {
    const date = dateFromYYYYMMDD(stringDate)
    return date >= fromDate && date < toDate
  })
  return { ...changelog, versions }
}

/**
 * Grouping Array.<ParsedVersion> in changelog by changeTypes
 * @param {ParsedChangelog} changelog - parsed changes grouped by package version
 * @return {GroupedChangelog}
 */
const groupingChanges = changelog => {
  const versionsGroupedByChanges = {
    Added: [],
    Changed: [],
    Deprecated: [],
    Removed: [],
    Fixed: [],
    Security: []
  }
  for (const version of changelog.versions) {
    const types = Object.keys(version.parsed).filter(key => key !== '_')
    for (const changeType of types) {
      versionsGroupedByChanges[changeType].push({
        version: version.version,
        date: version.date,
        log: version.parsed[changeType]
      })
    }
  }
  const versions = filterEmptyArrayProperties(versionsGroupedByChanges)
  const changes = Object.entries(versions).map(([type, versions]) => ({ type, versions }))
  return { ...changelog, changes }
}
/**
 * Compare function for sorting packages by names and order info
 * If name not stored in info sorting does not occur
 * @param {string} aName
 * @param {string} bName
 * @param {Object} order
 * @return {number}
 */
const sortPackagesByNames = (aName, bName, order) => {
  const aOrder = order[aName] ? order[aName] : 0
  const bOrder = order[bName] ? order[bName] : 0
  return bOrder - aOrder
}

/**
 * Render grouped changelogs to markdown using template
 * @param {GroupedChangelog} packages
 * @param {string} templatePath
 * @return {string}
 */
const renderToMD = (
  packages,
  templatePath = path.join(__dirname, '../../tmpl/html', 'allPacksChanges.mustache')
) => Mustache.render(fs.readFileSync(templatePath, 'utf-8'), { packages })

/**
 * Convert date in yyyy-mm-dd format to js Date object
 * @param {string} stringDate
 * @returns {Date}
 */
const dateFromYYYYMMDD = stringDate => {
  const [y, m, d] = stringDate.split('-')
  return new Date(Number(y), m - 1, Number(d))
}

const getPackageInfo = pathToPackage => {
  const pathToJson = path.join(pathToPackage, 'package.json')
  const packageInfo = fs.existsSync(pathToJson)
    ? JSON.parse(fs.readFileSync(pathToJson, 'utf-8'))
    : { name: path.basename(pathToPackage), repository: '' }
  return packageInfo
}

/**
 * Filter empty array properties in object
 * @param {Object} object
 * @return {Object}
 */
const filterEmptyArrayProperties = object => {
  const filteredObj = {}
  for (const key of Object.keys(object)) {
    if (!Array.isArray(object[key]) || object[key].length !== 0) {
      filteredObj[key] = object[key]
    }
  }
  return filteredObj
}

module.exports = {
  getChangelogPaths,
  getParsedChangelogs,
  getParseErrors,
  filterLogByDate,
  groupingChanges,
  sortPackagesByNames,
  renderToMD,
  dateFromYYYYMMDD
}
