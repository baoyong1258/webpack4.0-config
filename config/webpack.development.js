const { smart } = require('webpack-merge');
const baseConfig = require('./webpack.base.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = smart(baseConfig, {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader','css-loader','postcss-loader'],
            },
            {
                test: /\.scss$/,
                use: ['style-loader','css-loader', 'postcss-loader', 'sass-loader'],
            },
            {
                test: /\.(jpe?g|png|gif)$/,
                loader: 'url-loader',
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, '../src/index.html'),
        }),
    ],
    devServer: {
        port: 8090,
    }
})