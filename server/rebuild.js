var path = require('path'),
    _ = require('lodash'),
    tinyLr = require('tiny-lr'),
    notifier = require('node-notifier'),
    make = require('enb').make,
    watch = require('chokidar').watch,

    rootDir = path.join(__dirname, '..'),
    watchOpts = {
        persistent: true,
        ignoreInitial: true
    };

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

var debouncedRebuild = _.debounce(rebuild, 30, { leading: true, trailing: true });

process.env.NO_AUTOMAKE || watch([
        path.join(rootDir, '*.blocks/**'),
        path.join(rootDir, '*.bundles/**/*.bemdecl.js')
    ], watchOpts).on('all', debouncedRebuild);

// livereload
process.env.NO_LIVERELOAD || watch([
    path.join(rootDir, 'static', '*.min.*'),
    path.join(rootDir, 'desktop.bundles/*/*.bemhtml.js'),
    path.join(rootDir, 'desktop.bundles/*/*.bemtree.js'),
], watchOpts).on('all', function(event, file) {
    tinyLr.changed(file);
});

module.exports = function(app) {
    if (!app) return;

    // livereload middleware
    // serves the script injected by development.blocks/livereload template
    app.use(tinyLr.middleware({ app: app, dashboard: true }));
};
