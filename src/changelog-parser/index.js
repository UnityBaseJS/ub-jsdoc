const utils = require('./utils')
const {
  getChangelogPaths, getParsedChangelogs,
  getParseErrors, filterLogByDate,
  groupingChanges, sortPackagesByNames, renderToMD
} = utils

/**
 * Generating one changelog for all provided packages for date range
 * @param {Array.<string>} includePaths
 * @param {Array.<string>} excludePaths
 * @param {Date} fromDate
 * @param {Date} toDate
 * @param {Object} order - key-value info for ordering packages
 */
const generate = (includePaths, excludePaths, fromDate = new Date(1970, 1, 1), toDate = new Date(), order) => {
  const pathsToChangelogs = getChangelogPaths(includePaths, excludePaths)
  const parsedChangelogs = getParsedChangelogs(pathsToChangelogs)
  const errors = getParseErrors(parsedChangelogs)
  if (errors !== '') {
    console.error(errors)
    throw new Error('Parse errors')
  }
  const allPacksChanges = parsedChangelogs
    .map(cl => filterLogByDate(cl, fromDate, toDate))
    .map(cl => groupingChanges(cl))
    .filter(({ changes }) => changes.length > 0)

  if (order) {
    allPacksChanges.sort((a, b) => sortPackagesByNames(a.name, b.name, order))
  }
  const renderedChanges = renderToMD(allPacksChanges)
  return renderedChanges
}
/**
 * Checking correctness of all changelogs
 * @param includePaths
 * @param excludePaths
 */
const checkErrors = (includePaths, excludePaths) => {
  const pathsToChangelogs = getChangelogPaths(includePaths, excludePaths)
  const parsedChangelogs = getParsedChangelogs(pathsToChangelogs)
  const errors = getParseErrors(parsedChangelogs)
  if (errors === '') {
    console.log('No errors.')
  } else {
    console.error(errors)
    throw new Error('Parse errors')
  }
}

module.exports = {
  generate,
  checkErrors,
  ...utils
}
