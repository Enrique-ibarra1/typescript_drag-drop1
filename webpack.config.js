//path is included in library, allows us to resolve an absolute path instead of writing path = './src/dist' or whatever
const path = require('path');
module.exports = {
    entry: './src/app.ts',
    output: {
        filename: 'bundle.js',
        //__dirname is available globally in a node project
        path: path.resolve(__dirname, 'dist')
    },
    //tells webpack theres default source maps it should bundle
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                //regex checking for files ending in .ts
                test: /\.ts$/,
                //what webpack should do with these files:
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    // devServer: {
    //     open: true,
    //     watchContentBase: true,
    //     contentBase: '.',
    //     publicPath: '/dist',
    //     hot: false,
    //     liveReload: true
    // }
};