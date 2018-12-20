const { smart } = require('webpack-merge');
const baseConfig = require('./webpack.base.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = smart(baseConfig, {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: ['css-loader','postcss-loader'],
                    publicPath: '../../'       
                })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: ['css-loader', 'postcss-loader', 'sass-loader'],
                    publicPath: '../../'       
                })
            },
            {
                test: /\.(jpe?g|png|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,    // 小于8k的图片自动转成base64格式，并且不会存在实体图片
                            outputPath: 'static/img'   // 图片打包后存放的目录
                        }
                    }
                ]
            },
        ]
    },
    plugins: [
        new ExtractTextPlugin('static/css/[name].[chunkhash].css'),  
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, '../src/index.html'),
        }),
    ],
    devServer: {
        port: 8090,
    }
})