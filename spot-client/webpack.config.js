/* global __dirname, process */

const CircularDependencyPlugin = require('circular-dependency-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');
const webpack = require('webpack');

const mode = process.env.NODE_ENV === 'production'
    ? 'production' : 'development';

module.exports = {
    devServer: {
        compress: true,
        contentBase: path.join(__dirname, '/'),
        historyApiFallback: true,
        port: 8000,
        publicPath: '/dist/'
    },
    entry: './src/index.js',
    mode,
    module: {
        rules: [
            {
                enforce: 'pre',
                exclude: /(node_modules)/,
                loader: 'eslint-loader',
                test: /\.js$/
            },
            {
                test: /\.(css|scss)$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(jpg|gif)$/,
                loader: 'file-loader'
            },
            {
                test: /\.(svg|ttf|eot|woff)$/,
                loader: 'url-loader'
            },
            {
                // Parts of lib-jitsi-meet bring in jitsi's js-utils, which
                // has flow annotations that need processing through babel.
                exclude: new RegExp(`${__dirname}/node_modules/(?!js-utils)`),
                loader: 'babel-loader',
                test: /\.js$/
            }
        ]
    },
    plugins: [
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true
        }),
        new CopyWebpackPlugin([
            {
                from: './node_modules/lib-quiet-js/dist/quiet-emscripten.js',
                to: '.'
            },
            {
                from:
                    './node_modules/lib-quiet-js/dist/quiet-emscripten.js.mem',
                to: '.'
            },
            {
                from:
                    './node_modules/lib-quiet-js/dist/quiet-emscripten.js.mem',
                to: '.'
            },
            {
                from: './static',
                to: '.'
            },
            {
                from: './config.js',
                to: './config'
            }
        ]),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        new Dotenv({
            systemvars: true // Respect existing environment variables
        }),
        new WriteFilePlugin()
    ],
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        modules: [
            path.resolve('./src'),
            path.resolve('./node_modules')
        ]
    }
};
