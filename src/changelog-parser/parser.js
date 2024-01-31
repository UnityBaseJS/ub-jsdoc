/*
Copyright (c) Nate Goldman ungoldman@gmail.com
https://github.com/hypermodules/changelog-parser

Adopted by Andrey Kukuruza
*/

const EOL = require('os').EOL
const fs = require('fs')

const changesTypesArr = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Chores', 'Security']
const changeTypes = new Set(changesTypesArr)

// patterns
const semverReqExp = /\[?v?([\w\d.-]+\.[\w\d.-]+[a-zA-Z0-9])]?/
const dateReqExp = /.*[ ](\d\d?\d?\d?[-/.]\d\d?[-/.]\d\d?\d?\d?).*/
const subheadReqExp = /^###/
const listItemReqExp = /^[^#\n]../

function parseChangelog (file) {
  const data = {
    log: { versions: [] },
    current: null,
    parseErrors: []
  }
  const hl = handleLine.bind(data)
  fs.readFileSync(file).toString().split('\n').forEach(hl)
  pushCurrent(data)
  return { versions: data.log.versions, parseErrors: data.parseErrors }
}

function handleLine (line, index) {
  // skip line if it's a link label
  if (line.match(/^\[[^[\]]*] *?:/)) return

  // set title if it's there
  if (!this.log.title && line.match(/^# ?[^#]/)) {
    this.log.title = line.substring(1).trim()
    return
  }

  // skip unreleased
  if (line.match(/^## \[Unreleased]/)) return

  // new version found!
  if (line.match(/^## ?[^#]/)) {
    if (this.current && this.current.title) pushCurrent(this)

    this.current = versionFactory()

    if (!semverReqExp.exec(line)) {
      this.parseErrors.push(`
Line containing the version of the package is expected.
Received: 
${line}
at ${index + 1} line`)
    }
    if (semverReqExp.exec(line)) this.current.version = semverReqExp.exec(line)[1]

    this.current.title = line.substring(2).trim()
    if (this.current.title && !dateReqExp.exec(this.current.title)) {
      this.parseErrors.push(`
Line containing the date of the package publish is expected.
Received: 
${line}
at ${index + 1} line`)
    }
    if (this.current.title && dateReqExp.exec(this.current.title)) this.current.date = dateReqExp.exec(this.current.title)[1]

    return
  }

  // deal with body or description content
  if (this.current) {
    this.current.body += line + EOL

    // handle case where current line is a 'subheadReqExp':
    // - 'handleize' subheadReqExp.
    // - add subheadReqExp to 'parsed' data if not already present.
    if (subheadReqExp.exec(line)) {
      const key = line.replace('###', '').trim()
      if (!changeTypes.has(key)) {
        // this.parseErrors.push
        console.error(`
Line containing one of ${changesTypesArr.join(', ')} is expected.
Received: 
${line}
at ${index + 1} line`)
      }
      if (!this.current.parsed[key]) {
        this.current.parsed[key] = []
        this.current._private.activeSubhead = key
      }
    }

    // handle case where current line is a 'list item':
    if (listItemReqExp.exec(line)) {
      // add line to 'catch all' array
      this.current.parsed._.push(line)

      // add line to 'active subheadReqExp' if applicable (eg. 'Added', 'Changed', etc.)
      if (this.current._private.activeSubhead) {
        this.current.parsed[this.current._private.activeSubhead].push(line)
      }
    }
  } else {
    this.log.description = (this.log.description || '') + line + EOL
  }
}

function versionFactory () {
  return {
    version: null,
    title: null,
    date: null,
    body: '',
    parsed: {
      _: []
    },
    _private: {
      activeSubhead: null
    }
  }
}

function pushCurrent (data) {
  // remove private properties
  delete data.current._private
  data.log.versions.push(data.current)
}

module.exports = parseChangelog
