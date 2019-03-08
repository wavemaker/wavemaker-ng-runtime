module.exports = {
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    minSize: 1000000,
                    maxSize: 1000000,
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                        return `npm.${packageName.replace('@', '')}`;
                    }
                }
            }
        }
    }
}
