var path = require('path'),
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
process.env.NO_AUTOMAKE || watch([
        path.join(rootDir, '*.blocks/**'),
        path.join(rootDir, '*.bundles/**/*.bemdecl.js')
    ], watchOpts)
    .on('all', function(event, file) {
        console.time('Rebuild: ' + file);
        // NOTE: chokidar fires events before files are written
        process.nextTick(function() {
            // TODO: get target via file extention
            // TODO: get current bundle via websocket
            // NOTE: use `[path.join('desktop.bundles', 'index')]` to build specific target
            make()
                .then(function() {
                    console.timeEnd('Rebuild: ' + file);
                    notifier.notify({
                        title: 'Tycoon',
                        message: 'Build finished'
                    });
                })
                .fail(function(err) {
                    notifier.notify({
                        title: 'Build failed',
                        message: err
                    });
                });
        });
    });

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
