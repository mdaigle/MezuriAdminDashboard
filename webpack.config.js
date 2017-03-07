const webpack = require('webpack');
const path = require('path');
const AssetsPlugin = require('assets-webpack-plugin');

const assetsPluginInstance = new AssetsPlugin();

module.exports = {
    entry: {
        users: './js/users.js',
        microsoftGraphClient: '@microsoft/microsoft-graph-client',
        $: 'jquery'
    },
    output: {
        filename: '[chunkhash].[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['env'],
                    plugins: [
                        'syntax-dynamic-import',
                        'transform-async-to-generator',
                        'transform-regenerator',
                        'transform-runtime'
                    ]
                }
            }]
        }]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            names: ['microsoftGraphClient', '$', 'manifest']
        }),
        assetsPluginInstance
    ],
    devtool: "source-map"
};