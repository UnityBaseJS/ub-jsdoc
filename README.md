# ub-jsdoc

Documentation template theme for JSDoc 3 based on [minami](https://github.com/Nijikokun/minami) theme.
Inspired by [godoc](https://godoc.org/golang.org/x/tools/cmd/godoc)

![Screenshot](screenshot.png)

Live sample is a [UnityBase framework documentation](https://unitybase.info/api/serverNew/)

## Uses

- [the Taffy Database library](http://taffydb.com/)
- [Underscore Template library](http://documentcloud.github.com/underscore/#template)


## Install

```bash
$ npm install --save-dev ub-jsdoc
```

## Usage

Clone repository to your designated `jsdoc` template directory, then:

```bash
$ jsdoc entry-file.js -t path/to/ub-jsdoc
```

### Node.js Dependency

In your projects `package.json` file add a generate script:

```json
"script": {
  "generate-docs": "node_modules/.bin/jsdoc --configure .jsdoc.json --verbose"
}
```

In your `.jsdoc.json` file, add a template option.

```json
"opts": {
  "template": "node_modules/ub-jsdoc"
}
```

### Example JSDoc Config

```json
{
    "tags": {
        "allowUnknownTags": true,
        "dictionaries": ["jsdoc"]
    },
    "source": {
        "include": ["lib", "package.json", "README.md"],
        "includePattern": ".js$",
        "excludePattern": "(node_modules/|docs)"
    },
    "plugins": [
        "plugins/markdown",
	"./ub-jsdocs/plugins/sripPFromDescription"
    ],
    "templates": {
        "cleverLinks": true,
        "monospaceLinks": false,

	"buildInURL": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/",
	"buildins": ["array", "arraybuffer", "boolean", "date", "error", "function", "json", "number", "object", "regexp", "string", "null"],
	"smallSourceLink": true, 
	"hideAuthor": true, 
	"stylesheet": "styles/ub-jsdoc.css",
	"googleAnalytics": "yourGAAccount",  
        "default": {
            "outputSourceFiles": true
        }
    },
    "opts": {
        "destination": "./docs/",
        "encoding": "utf8",
        "private": true,
        "recurse": true,
        "template": "./node_modules/ub-jsdoc"
    }
}
```

## License

Licensed under the Apache2 license.