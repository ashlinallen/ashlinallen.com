'use strict';

var path = require('path'),
    webpack = require('webpack'),
    webpackBase = require('./webpack.config.base'),
    browserSyncPlugin = require('browser-sync-webpack-plugin'),
    hotMiddlewareScript = ['webpack-hot-middleware/client?reload=true'],
    devIp = 'localhost',
    devPort = '3000';

// Create an object from the webpack.config.base file, which we will apply our development settings
var config = Object.create(webpackBase);

// Set development-only config values
config.debug = true;
config.output.pathinfo = true;
config.devtool = 'source-map';

// Add webpack-hot-middleware script to each entrypoint in the base config
for(var index in config.entry) { 
   if (config.entry.hasOwnProperty(index) && (index !== 'vendor')) {
       config.entry[index] = hotMiddlewareScript.concat(config.entry[index]);
   }
}

// Add any development-only preloaders here, as you would in the base config
var devPreLoaders = [
    {
        test: /\.js$/,
        exclude: [/node_modules/, /ng-modal/, /exception-handler/, /app.module/], 
        loader: 'jshint-loader'
    }
];

// Add any development-only loaders here, as you would in the base config
var devLoaders = [
];

// Add any development-only plugins here, as you would in the base config
var devPlugins = [
    new webpack.DefinePlugin({
        // Set node_env to development. Many modules/plugins/frameworks will reference this.
        'process.env': { NODE_ENV: '"development"' }
    }),
    new browserSyncPlugin(
        // BrowserSync options
        {
            host: devIp,
            port: 3001,
            // proxy the Express server endpoint through BrowserSync
            proxy: 'http://' + devIp + ':' + devPort + '/'
        },
        {
            // prevent BrowserSync from reloading the page
            // and let Webpack Dev Server take care of this
            reload: false
        }
    ),
    new webpack.HotModuleReplacementPlugin(), // Generates Hot Update Chunks of each chunk in the records
    new webpack.NoErrorsPlugin(), // Handle errors so CLI doesn't fail when a plugin has a compile error
];

// Push our development-only preloaders, loaders and plugins to the baseConfig loader and plugin arrays
config.module.preLoaders = devPreLoaders.concat(config.module.preLoaders);
config.module.loaders = devLoaders.concat(config.module.loaders);
config.plugins = devPlugins.concat(config.plugins);

module.exports = config;