// For a detailed explanation regarding each configuration property, visit:
// https://webpack.js.org/configuration/#options

// eslint-disable-next-line import/no-extraneous-dependencies
const {merge} = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    output: {
        filename: '[name].[contentHash].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    },
    devServer: {
        static: path.resolve(__dirname, 'dist'),
        port: 3000,
        open: true,
    },
    devtool: 'inline-source-map',
});
