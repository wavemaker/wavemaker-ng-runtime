const CompressionPlugin = require(`compression-webpack-plugin`);
const path = require(`path`);
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

const wmPropertiesPath = path.join(__dirname, '/src/app/wmProperties.js');

const { WMAppProperties } = require(wmPropertiesPath);

const localesToKeep = Object.values(WMAppProperties.supportedLanguages)
  .map(lang => lang.moment)
  .filter(locale => locale !== null);

const includeMomentPlugin = WMAppProperties.languageBundleSources === "STATIC";

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
        // On STATIC WMAppProperties.languageBundleSources, required moment locales are included in the bundle

        /**
         * MomentLocalesPlugin is used to include only the required moment locales in the bundle.
         */
        ...(includeMomentPlugin ? [ new MomentLocalesPlugin({ localesToKeep }) ] : [])
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
