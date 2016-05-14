var webpack = require('webpack'),
    LiveReload = require('webpack-livereload-plugin');

module.exports = {
    entry: './demo.js',
    output: {
        path: __dirname,
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            { test: /\.(vert)|(frag)$/, loader: "raw-loader" }
        ],
    },
    plugins: [
        new LiveReload()
    ]
}
