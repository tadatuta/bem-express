const path = require('path');
const config = require('./config');
const fs = require('fs');
const nodeEval = require('node-eval');




const isDev = process.env.NODE_ENV === 'development';
const useCache = !isDev;
const cacheTTL = config.cacheTTL;
let templates = null;
let cache = Object.create(null);


const bundles = getDirectories('./bundles/desktop.bundles'),
    bundlesTemplates = {};

bundles.forEach(function (bundle) {


    let pathToBundle = path.resolve('bundles', 'desktop.bundles', bundle),
        BEMTREE = require(path.join(pathToBundle, bundle + '.bemtree.js')),
        BEMHTML = require(path.join(pathToBundle, bundle + '.bemhtml.js'));

    bundlesTemplates['desktop-' + bundle] = Object.assign(BEMTREE, BEMHTML);


    pathToBundle = path.resolve('bundles', 'touch.bundles', bundle);
    BEMTREE = require(path.join(pathToBundle, bundle + '.bemtree.js'));
    BEMHTML = require(path.join(pathToBundle, bundle + '.bemhtml.js'));

    bundlesTemplates['touch-' + bundle] = Object.assign(BEMTREE, BEMHTML);

});



function render(req, res, data, context) {
    const query = req.query;
    const user = req.user;
    const cacheKey = req.originalUrl + (context ? JSON.stringify(context) : '') + (user ? JSON.stringify(user) : '');
    const cached = cache[cacheKey];

    if (useCache && cached && (new Date() - cached.timestamp < cacheTTL)) {
        return res.send(cached.html);
    }

    if (isDev && query.json) return res.send('<pre>' + JSON.stringify(data, null, 4) + '</pre>');

    const bemtreeCtx = {
        block: 'root',
        context: context,
        // extend with data needed for all routes
        data: Object.assign({}, {
            url: req._parsedUrl,
            csrf: req.csrfToken()
        }, data)
    };

    if (isDev) templates = getTemplates(data.page, data.bundle);

    let bemjson;

    try {
        if (isDev) {
            bemjson = templates.BEMTREE.apply(bemtreeCtx);
        }
        else {
            bemjson = bundlesTemplates[data.bundle + '-' + data.page] && bundlesTemplates[data.bundle + '-' + data.page].BEMTREE.apply(bemtreeCtx);
        }
    } catch(err) {
        console.error('BEMTREE error', err.stack);
        console.trace('server stack');
        return res.sendStatus(500);
    }

    if (isDev && query.bemjson) return res.send('<pre>' + JSON.stringify(bemjson, null, 4) + '</pre>');

    let html;

    try {
        if (isDev) {
            html = templates.BEMHTML.apply(bemjson);
        }
        else {
            html = bundlesTemplates[data.bundle + '-' + data.page] && bundlesTemplates[data.bundle + '-' + data.page].BEMHTML.apply(bemjson);
        }
    } catch(err) {
        console.error('BEMHTML error', err.stack);
        return res.sendStatus(500);
    }

    useCache && (cache[cacheKey] = {
        timestamp: new Date(),
        html: html
    });

    res.send(html);
}

function dropCache() {
    cache = Object.create(null);
}

function evalFile(filename) {
    console.log(123);
    return nodeEval(fs.readFileSync(filename, 'utf8'), filename);
}

function getTemplates(bundleName = 'index', level = 'desktop') {
    var pathToBundle = path.resolve('bundles', level + '.bundles', bundleName);
    //console.log(pathToBundle);
    return {
        BEMTREE: evalFile(path.join(pathToBundle, bundleName + '.bemtree.js')).BEMTREE,
        BEMHTML: evalFile(path.join(pathToBundle, bundleName + '.bemhtml.js')).BEMHTML
    };
}

function getDirectories(_path) {
    return fs.readdirSync(_path).filter(function (file) {
        return fs.statSync(_path + '/' + file).isDirectory();
    });
}

module.exports = {
    render: render,
    dropCache: dropCache
};
