const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');

module.exports = merge(baseConfig, {
    mode: 'development',
    entry: {
      app: path.resolve(__dirname, './entry.js')
    },
    devServer: {
        port: 9000,
        compress: false,
        contentBase: path.resolve(__dirname, './dist')
    }
});
