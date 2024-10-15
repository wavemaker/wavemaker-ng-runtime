/**
 * There is an issue with Angular 11 build where compression is happening before uglification, resulting in these unuglified files.
 * This is a temporary fix to move compression after uglification, not required in latest WMO 11.8.5(Angular 17).
 **/
const path = require('path');
const fs = require('fs');

class PostBuildCompressionPlugin {
    apply(compiler) {
        compiler.hooks.done.tap("PostBuildCompressionPlugin", (stats) => {
            const outputPath = stats.compilation.outputOptions.path;
            setTimeout(() => {
                const assets = stats.toJson().assets;
                assets.forEach((asset) => {
                    const filePath = path.join(outputPath, asset.name);
                    if (fs.existsSync(filePath) && /.(js|css|html)$/.test(asset.name)) {
                        const content = fs.readFileSync(filePath, "utf8");
                        const gzip = require("zlib").gzipSync;
                        const compressed = gzip(content);
                        const path = require('path');
                        // Parse the filename to create the new gzip filename
                        const parsedPath = path.parse(asset.name);
                        const gzipFileName = parsedPath.name + '.gzip' + parsedPath.ext;
                        const gzipFilePath = path.join(outputPath, gzipFileName);
                        fs.writeFileSync(gzipFilePath, compressed);
                    }
                });
            }, 1000);
        });
    }
}

module.exports = {
    resolve: {
        alias: {
            themes: path.resolve(__dirname, `src/assets/themes/`)
        }
    },
    plugins: [
        new PostBuildCompressionPlugin()
    ],
    optimization: {
        splitChunks: {
            automaticNameDelimiter: '-',
            cacheGroups: {
                vendor: {
                    minSize: 1000000,
                    maxSize: 1000000,
                    test: /[/]node_modules(?![/]wm)[/]/
                }
            }
        }
    }
}
