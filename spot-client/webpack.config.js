/* global __dirname, process */

const CircularDependencyPlugin = require('circular-dependency-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    devServer: {
        compress: true,
        contentBase: path.join(__dirname, '/'),
        port: 8000,
        publicPath: '/dist/'
    },
    entry: {
        app: './src/index.js',
        config: './config'
    },
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
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
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                test: /\.js$/
            }
        ]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new WriteFilePlugin(),
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        new Dotenv({
            systemvars: true // Respect existing environment variables
        })
    ],
    resolve: {
        modules: [
            path.resolve('./src'),
            path.resolve('./node_modules')
        ]
    }
};
