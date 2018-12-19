const { smart } = require('webpack-merge');
const baseConfig = require('./webpack.base.js');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');//压缩css插件

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
              test: /jquery/, // 直接使用 test 来做路径匹配
              chunks: "initial",
              name: "vendor",
              enforce: true,
            },
          },
        },
    },
    plugins: [
        new OptimizeCssAssetsPlugin()
    ]
})