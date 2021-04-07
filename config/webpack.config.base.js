const path = require('path');
const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  output: {
    path: path.resolve(__dirname, '../dist')
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        exclude: [
          /node_modules/
        ],
        use: 'vue-loader'
      },
      {
        test: /.(jsx?)$/,
        exclude: [
          /node_modules/
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true,
              cacheDirectory: true,
              rootMode: 'upward',
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        exclude: [
          /node_modules/
        ],
        use: [
            'style-loader',
            'css-loader',
            {
                loader: 'postcss-loader',
            },
            {
                loader: 'sass-loader',
                options: {}
            }
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        exclude: [
          /node_modules/
        ],
        use: {
            loader: 'file-loader',
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}
