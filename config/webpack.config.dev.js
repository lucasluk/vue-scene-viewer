const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');

module.exports = merge(baseConfig, {
    mode: 'development',
    entry: {
      app: path.resolve(__dirname, '../src/index.js')
    },
    devServer: {
        port: 8000,
        compress: false,
        contentBase: path.resolve(__dirname, './dist')
    }
});
