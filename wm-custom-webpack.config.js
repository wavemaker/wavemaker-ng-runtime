const CompressionPlugin = require(`compression-webpack-plugin`);
module.exports = {
    plugins:[
        new CompressionPlugin({
            filename(info){
                let opFile= info.path.split('.'),
                opFileType =  opFile.pop(),
                opFileName = opFile.join('.');
                return `${opFileName}.gz.${opFileType}`;
            }
        })
    ],
    optimization: {
        splitChunks: {
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
