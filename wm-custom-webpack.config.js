const CompressionPlugin = require(`compression-webpack-plugin`);
const path = require(`path`);
module.exports = {
    resolve:{
        alias:{
            themes: path.resolve(__dirname,`src/assets/themes/`)
        }
    },
    plugins:[
        new CompressionPlugin({
            test: /\.(js|css|html|svg|txt|eot|otf|ttf|gif)$/,
            filename: "[name].gzip[ext]",
            algorithm: "gzip"
        }),
        new CompressionPlugin({
            test: /\.(js|css|html|svg|txt|eot|otf|ttf|gif)$/,
            filename: "[name].br[ext]",
            algorithm: "brotliCompress"
        }),
    ],
    optimization: {
        splitChunks: {
            automaticNameDelimiter:'-',
            cacheGroups: {
                vendor: {
                    minSize: 1000000,
                    maxSize: 1000000,
                    test: /[\\/]node_modules(?![\\/]wm)[\\/]/
                }
            }
        }
    }
}
