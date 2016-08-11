'use strict';

var webpack = require('webpack'),
    webpackBase = require('./webpack.config.base');

// Create an object from the webpack.config.base file, which we will customize for production use
var config = Object.create(webpackBase);

// Add any production-only loaders here, as you would in the base config
var prodLoaders = [
];

// Add any production-only plugins here, as you would in the base config
var prodPlugins = [
    new webpack.DefinePlugin({
        // Set node_env to development. Many modules/plugins/frameworks will reference this.
        'process.env': { NODE_ENV: '"production"' }
    }),
    new webpack.optimize.DedupePlugin(), // Dedupe JavaScript modules
    new webpack.optimize.UglifyJsPlugin(), // Uglify JavaScript output
];

// Push our production-only loaders and plugins to the baseConfig loader and plugin arrays
config.module.loaders = prodLoaders.concat(config.module.loaders);
config.plugins = prodPlugins.concat(config.plugins);

module.exports = config;