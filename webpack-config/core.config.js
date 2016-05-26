module.exports = {
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
