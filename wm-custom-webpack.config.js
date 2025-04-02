const CompressionPlugin = require(`compression-webpack-plugin`);
const path = require(`path`);
const {ConcatSource} = require("webpack-sources");

const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

const wmPropertiesPath = path.join(__dirname, '/src/app/wmProperties.js');

const { WMAppProperties } = require(wmPropertiesPath);

const localesToKeep = Object.values(WMAppProperties.supportedLanguages)
  .map(lang => lang.moment)
  .filter(locale => locale !== null);

  const includeMomentPlugin = WMAppProperties.languageBundleSources === "STATIC";

class ModifyCssAssetUrlsPlugin {
    apply(compiler) {
        compiler.hooks.compilation.tap('ModifyCssAssetUrlsPlugin', compilation => {
            compilation.hooks.optimizeAssets.tapAsync('ModifyCssAssetUrlsPlugin', (assets, callback) => {
                let publicPath = compilation.options.output.publicPath;
                let isResourceWithDeployUrl = false;
                for (const assetName in assets) {
                    if (!assets.hasOwnProperty(assetName)) continue;

                    const asset = assets[assetName];
                    if (asset.sourceAndMap) {
                        const sourceAndMap = asset.sourceAndMap();
                        let updatedSource = sourceAndMap.source;
                        // Handle potential non-string source (e.g., convert to string)
                        if (typeof updatedSource !== 'string') {
                            updatedSource = updatedSource.toString('utf-8');
                        }
                        let modifiedSource = updatedSource.replace(/url\((.*?)\)/g, (match, url) => {
                            isResourceWithDeployUrl = true;

                            let qUrl = url.slice(1, -1);

                            if (!qUrl.startsWith(publicPath)) {
                                return match;
                            } else {
                                const newUrl = this.modifyUrl(publicPath, qUrl);
                                let urlString = `url('${newUrl}')`;
                                return urlString;
                            }

                        });
                        if (isResourceWithDeployUrl) {
                            isResourceWithDeployUrl = false;
                            assets[assetName] = new ConcatSource(modifiedSource);
                        }
                    }
                }
                callback(null, assets);
            });
        });
    }

    modifyUrl(publicPath, url) {
        let qUrl = url;
        let resourceName = qUrl;
        try {
            const parsedUrl = new URL(qUrl);
            resourceName = parsedUrl.pathname.split('/').pop();
        } catch (e) {
            //this is relative url
            let parts = qUrl.split('/');
            resourceName = parts[parts.length - 1];
        }
        let newUrl = `ng-bundle/${resourceName}`;
        return newUrl;
    }
};

module.exports = {
    resolve:{
        alias:{
            themes: path.resolve(__dirname,`src/assets/themes/`)
        }
    },
    plugins:[
        new ModifyCssAssetUrlsPlugin(),
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
