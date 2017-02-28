var webpack = require('webpack'),
    coreConfig = require('./core.config'),

    libraryName = 'cognrender',
    outputFile =  libraryName + '.js';

module.exports = coreConfig;
module.exports.entry = './entry.js';
module.exports.output = {
    path: './build',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
};
