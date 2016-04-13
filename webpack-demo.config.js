var webpack = require('webpack');
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
    }
}
