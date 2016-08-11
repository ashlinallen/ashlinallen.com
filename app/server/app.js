var path = require('path'),
    express = require('express'),
    devMiddleware,
    dbConnection,
    app = express(),
    oneDay = 86400000,
    oneWeek = 604800000,
    ip = '0.0.0.0',
    isDeveloping = (process.env.NODE_ENV.trim() !== 'production'),
    port = (process.env.PORT || 3000),
    defaultFile = '../../dist/index.html';
        
var defaultFileRelativePath = path.join(__dirname, defaultFile);

function init () {
    if (isDeveloping) {
        configDevServer();
    } else {
        configProdServer();
    }

    startWebServer();
}

init();

function configDevServer () {
    // If we're developing, we need to add some webpack middleware to express so we get hot module replacement and rebundling on-save.
    var webpack = require('webpack'),
        webpackConfig = require('../../webpack.config.development'),
        webpackDevMiddleware = require('webpack-dev-middleware'),
        webpackHotMiddleware = require('webpack-hot-middleware');
        
    var compiler = webpack(webpackConfig);
    
    devMiddleware = webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        historyApiFallback: true,
        stats: {  
            chunks: false,
            children: false
        }
    });
    
    app.use(devMiddleware);
    app.use(webpackHotMiddleware(compiler));
    
    app.get('*', respondFromMiddleware);
}

function configProdServer () {
    app.use(express.static(path.join(__dirname, '../../dist/'), { maxage: oneWeek, index: false }));
    
    app.get('*', respondFromFilesystem);
}

function respondFromMiddleware (req, res) {
    res.write(devMiddleware.fileSystem.readFileSync(defaultFileRelativePath));
    res.end();
}

function respondFromFilesystem (req, res) {
    res.sendFile(defaultFileRelativePath);
}

function startWebServer () {
    app.listen(port, ip, function onStart(err) {
        if (err) { console.log(err); }
        
        console.info('Express listening at http://%s:%s/', ip, port);
    });
}