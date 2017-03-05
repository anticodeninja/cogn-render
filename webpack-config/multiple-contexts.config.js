var webpack = require('webpack'),
    coreConfig = require('./core.config'),
    LiveReload = require('webpack-livereload-plugin');

module.exports = coreConfig;
module.exports.entry = './demo/multiple-contexts.js';
module.exports.plugins = [ new LiveReload() ];
