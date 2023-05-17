const path = require('path');
const TerserWebpackPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './index.mjs',
    module: {
        rules: [
            {
                loader:  'babel-loader',
                test: /\.mjs$/,
                include: [
                    path.resolve(__dirname, 'src'),
                ],
                options: {
                    presets: [
                        '@babel/preset-env'
                    ]
                },
            }
        ],
    },
    resolve: {
        modules: [
            'node_modules',
            path.resolve(__dirname, 'src'),
        ],
        extensions: ['.mjs', '.js'],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserWebpackPlugin(),
        ],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'cookie-consent-resolver.min.js',
        library: {
            type: 'var',
            name: 'CookieConsentResolver',
            export: 'default',
        },
    }
};
