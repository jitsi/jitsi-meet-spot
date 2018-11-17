/* global __dirname, process */

const CircularDependencyPlugin = require('circular-dependency-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

const current = process.env.NODE_ENV;

let plugins = [
    new CircularDependencyPlugin({
        exclude: /node_modules/,
        failOnError: true
    }),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(current)
    }),
    new Dotenv()
];

if (current === 'production') {
    plugins = [
        new UglifyJSPlugin(),
        ...plugins
    ];
}

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins,
    module: {
        rules: [
            {
                enforce: 'pre',
                exclude: /(node_modules)/,
                loader: 'eslint-loader',
                test: /\.js$/
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true
                        }
                    }
                ]
            },
            {
                test: /\.(jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader'
                    }
                ]
            },
            {
                test: /\.(svg|ttf|eot|woff)$/,
                use: [
                    {
                        loader: 'url-loader'
                    }
                ]
            },
            {
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                test: /\.js$/
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve('./src'),
            path.resolve('./node_modules')
        ]
    }
};
