module.exports = {
    levels: [
        'blocks/*.blocks'
    ],

    excludePaths: [
        'node_modules/**'
    ],

    plugins: {
        'bemhint-css-naming': {
            techs: {
                styl: true,
                'post.css': true,
                css: true
            }
        },
        'bemhint-fs-naming': true,
        'bemhint-deps-specification': true
    }
};
