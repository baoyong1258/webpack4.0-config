const { smart } = require('webpack-merge');
const baseConfig = require('./webpack.base.js');

module.exports = smart(baseConfig, {
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
                    }
                ]
            },
        ]
    },
    devServer: {
        port: 8090,
    }
})