/* global __dirname, process */

const CircularDependencyPlugin = require('circular-dependency-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { DuplicatesPlugin } = require('inspectpack/plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');
const webpack = require('webpack');

module.exports = () => {
    const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

    return {
        devServer: {
            compress: true,
            historyApiFallback: true,
            host: '0.0.0.0',
            port: 8000,
            static: {
                directory: path.join(__dirname, '/'),
            },
            devMiddleware: {
                publicPath: '/dist/',
            },
        },
        devtool: 'source-map',
        entry: {
            app: './src/index.js',
        },
        mode,
        module: {
            rules: [
                {
                    enforce: 'pre',
                    exclude: /(node_modules)/,
                    loader: 'eslint-loader',
                    test: /\.js$/,
                },
                {
                    test: /\.(css|scss)$/,
                    use: ['style-loader', 'css-loader', 'sass-loader'],
                },
                {
                    test: /\.(svg|ttf|eot|woff)$/,
                    type: 'asset/inline'
                },
                {
                    loader: 'babel-loader',
                    options: {
                        plugins: [
                            require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
                            require.resolve('@babel/plugin-proposal-optional-chaining'),
                        ],
                    },
                    test: /\.js$/,
                },
            ],
        },
        plugins: [
            new CircularDependencyPlugin({
                exclude: /node_modules/,
                failOnError: true,
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: './static',
                        to: '.',
                    },
                    {
                        from: './config.js',
                        to: './config',
                    },
                ],
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(mode),
            }),
            new Dotenv({
                systemvars: true, // Respect existing environment variables
            }),
            new DuplicatesPlugin({
                emitErrors: true,
            }),
            new WriteFilePlugin(),
        ],
        output: {
            path: path.resolve(__dirname, 'dist'),
        },
        resolve: {
            modules: [path.resolve('./src'), path.resolve('./node_modules')],
        },
    };
};
