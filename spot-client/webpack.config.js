/* global __dirname, process */

const CircularDependencyPlugin = require('circular-dependency-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const { DuplicatesPlugin } = require('inspectpack/plugin');
const path = require('path');
const webpack = require('webpack');
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = () => {
    const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    const isProduction = mode === 'production';
    const detectCircularDeps = Boolean(process.env.DETECT_CIRCULAR_DEPS);

    return {
        devServer: {
            compress: true,
            historyApiFallback: true,
            host: '0.0.0.0',
            port: 8000,
            static: {
                directory: path.join(__dirname, '/')
            },
            devMiddleware: {
                publicPath: '/dist/'
            }
        },
        devtool: isProduction ? 'source-map' : 'eval-source-map',
        entry: {
            app: './src/index.js'
        },
        mode,
        module: {
            rules: [
                {
                    test: /\.(css|scss)$/,
                    use: [ 'style-loader', 'css-loader', 'sass-loader' ]
                },
                {
                    test: /\.(svg|ttf|eot|woff)$/,
                    type: 'asset/inline'
                },
                {
                    loader: 'babel-loader',

                    exclude: /node_modules/,
                    options: {
                        plugins: [
                            require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
                            require.resolve('@babel/plugin-proposal-optional-chaining')
                        ]
                    },
                    test: /\.js$/
                }
            ]
        },
        plugins: [
            detectCircularDeps
                && new CircularDependencyPlugin({
                    exclude: /node_modules/,
                    failOnError: true
                }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: './static',
                        to: '.'
                    },
                    {
                        from: './config.js',
                        to: './config'
                    }
                ]
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(mode)
            }),
            new Dotenv({
                systemvars: true // Respect existing environment variables
            }),
            new DuplicatesPlugin({
                emitErrors: true
            }),
            new WriteFilePlugin()
        ].filter(Boolean),
        output: {
            path: path.resolve(__dirname, 'dist')
        },
        optimization: {
            concatenateModules: isProduction,
            minimize: isProduction
        },
        resolve: {
            modules: [ path.resolve('./src'), path.resolve('./node_modules') ]
        }
    };
};
