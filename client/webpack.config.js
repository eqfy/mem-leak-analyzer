/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: path.resolve(__dirname, 'src'),
        use: [{
          loader: 'ts-loader',
          options: {
              configFile: "tsconfig.webpack.json"
          }
      }]
      },
      {
        test: /\.html$/i,
        include: path.resolve(__dirname, 'src'),
        loader: 'html-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    publicPath: 'out',
    path: path.resolve(__dirname, 'out'),
    filename: 'bundle.js'
  },
  optimization: {
    minimize: false
  }
  // devServer: {
  //   historyApiFallback: true,
  //   static: {
  //     directory: path.join(__dirname, '../../public')
  //   },
  //   proxy: {
  //     open: true,
  //     '/': 'http://localhost:1337'
  //   }
  // }
};
