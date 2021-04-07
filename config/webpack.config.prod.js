const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');

module.exports = merge(baseConfig, {
    mode: 'production',
    entry: {
      app: path.resolve(__dirname, '../src/index.js')
    },
    output: {
        libraryTarget: 'umd'
    }
});
