const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: path.resolve(__dirname, '../src/index.js'),
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../dist'),
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [path.resolve(__dirname, '../src')],
                exclude: /node_modules/,
                use: 'babel-loader'
            },
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
                test: /\.(eot|ttf|woff|svg)$/,
                use: 'file-loader'
            },
            {
                test: /\.(htm|html)$/,
                use: 'html-withimg-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.json']
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, '../src/index.html'),
        }),
        new ExtractTextPlugin('static/css/style.css'),  
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: 'static',
                ignore: ['.*']
            }
        ]),
    ]
}