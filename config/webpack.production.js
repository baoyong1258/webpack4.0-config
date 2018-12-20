const { smart } = require('webpack-merge');
const baseConfig = require('./webpack.base.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
;//压缩css插件

module.exports = smart(baseConfig, {
    output: {
        filename: 'static/js/[name].[chunkhash].js',
        chunkFilename: 'static/js/[name].[chunkhash].js',
        // chunkFilename: 'static/js/[id].[chunkhash].js',
        publicPath: './'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                  {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                      publicPath: '../../'
                    },
                  },
                  'css-loader',
                  'postcss-loader'
                ],
            },
            {
                test: /\.scss$/,
                use: [
                  {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                      publicPath: '../../'
                    },
                  },
                  'css-loader',
                  'postcss-loader',
                  'sass-loader'
                ],
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
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: { // 压缩 jpeg 的配置
                                progressive: true,
                                quality: 65
                            },
                            optipng: { // 使用 imagemin-optipng 压缩 png，enable: false 为关闭
                                enabled: false,
                            },
                            pngquant: { // 使用 imagemin-pngquant 压缩 png
                                quality: '65-90',
                                speed: 4
                            },
                            gifsicle: { // 压缩 gif 的配置
                                interlaced: false,
                            },
                            webp: { // 开启 webp，会把 jpg 和 png 图片压缩为 webp 格式
                                quality: 75
                            },
                        },
                    }
                ]
            },
        ]
    },
    optimization: {
        splitChunks: {
          cacheGroups: {
            vendor: {
              chunks: "initial",
              test: path.resolve(__dirname, "../node_modules"), // 路径在 node_modules 目录下的都作为公共部分
              name: "vendor", // 使用 vendor 入口作为公共部分
              enforce: true,
            },
          },
        },
    },
    plugins: [
        new CleanWebpackPlugin(path.resolve(__dirname, '../dist')),
        new MiniCssExtractPlugin({
            // 类似 webpackOptions.output里面的配置 可以忽略
            filename: 'static/css/[name].[contenthash].css',
            chunkFilename: '[id].[contenthash].css',
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html', // 配置输出文件名和路径
            template: path.resolve(__dirname, '../src/index.html'), // 配置文件模板
            minify: { // 压缩 HTML 的配置
              minifyCSS: true, // 压缩 HTML 中出现的 CSS 代码
              minifyJS: true, // 压缩 HTML 中出现的 JS 代码
              removeComments: true,
            },
          }),
        new OptimizeCssAssetsPlugin()
    ]
})