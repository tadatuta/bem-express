# bem-express

Almost the same as [project-stub](https://github.com/bem/project-stub/) but with [BEMTREE](https://en.bem.info/technology/bemtree/) and [Express](http://expressjs.com/).

[![Build Status](https://travis-ci.org/bem/bem-express.svg?branch=master)](https://travis-ci.org/bem/bem-express)

## Installation

```sh
npm i -g enb
git clone https://github.com/bem/bem-express.git
cd bem-express
npm i
```

## Development

```sh
npm run dev
```
will run initial `enb make` command and then start the server with `nodemon` which will restart it on any server file update. Also `chokidar` will watch for changes in `*.blocks/**` and rebuild the project automatically. Then livereload will update the page in the browser.

You may also set `NO_LIVERELOAD` env variable to switch livereload off:
```sh
NO_LIVERELOAD=1 npm run dev
```

You may also run rebuild manually with `enb make` or with external watcher (e.g. `npm run watch`). To switch off automatic rebuild use `NO_AUTOMAKE` env variable:
```sh
NO_AUTOMAKE=1 npm run dev
```

## Production

```sh
YENV=production enb make
NODE_ENV=production node server
```

## Templating

Templating starts in `root` block which replaces itself with `page` or any other context (if specified as argument to `render` function).

## Pro tips

Run server in dev mode with `NODE_ENV=development` environment variable (`nodemon` will set it for you).

In dev mode

* Add `?json=1` to URL to see raw data
* Add `?bemjson=1` to URL to see BEMJSON generated with BEMTREE templates.
