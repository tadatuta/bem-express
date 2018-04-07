const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const tinyLr = require('tiny-lr');
const notifier = require('node-notifier');
const make = require('enb').make;
const watch = require('chokidar').watch;

const rootDir = path.join(__dirname, '..');
const watchOpts = {
    persistent: true,
    ignoreInitial: true,
    ignored: '**/.DS_Store'
};

// get bundles list
const bundlesDir = path.join(rootDir, 'desktop.bundles');
const bundles = fs.readdirSync(bundlesDir).filter(function(file) {
    return fs.statSync(path.join(bundlesDir, file)).isDirectory();
});

// enb make
function rebuild(event, file) {
    // TODO: get target via file extention
    // TODO: get current bundle via websocket
    // NOTE: use `[path.join('desktop.bundles', 'index')]` to build specific target

    console.time('Rebuild: ' + file);
    return make()
        .then(function() {
            console.timeEnd('Rebuild: ' + file);
            notifier.notify({
                title: 'bem-express',
                message: 'Build finished'
            });
        })
        .fail(function(err) {
            notifier.notify({
                title: 'Build failed',
                message: err
            });
        });
}

const debouncedRebuild = _.debounce(rebuild, 30, { leading: true, trailing: true });

process.env.NO_AUTOMAKE || watch([
    path.join(rootDir, '*.blocks', '**'),
].concat(bundles.map(function(bundle) {
    return path.join(bundlesDir, bundle, bundle + '.bemdecl.js');
})), watchOpts).on('all', debouncedRebuild);

// livereload
process.env.NO_LIVERELOAD || watch([
    path.join(rootDir, 'static', '*.min.*'),
    path.join(bundlesDir, '*', '*.bemtree.js'),
].concat(bundles.map(function(bundle) {
    return path.join(bundlesDir, bundle, bundle + '.bemhtml.js');
})), watchOpts).on('all', function(event, file) {
    tinyLr.changed(file);
});

module.exports = function(app) {
    if (!app) return;

    // livereload middleware
    // serves the script injected by development.blocks/livereload template
    app.use(tinyLr.middleware({ app: app, dashboard: true }));
};
