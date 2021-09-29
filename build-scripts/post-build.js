const util = require(`util`);
const fs = require('fs-extra');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const copyFile = util.promisify(fs.copyFile);
const exec = util.promisify(require('child_process').exec);
const cheerio = require(`cheerio`);
const crypto = require(`crypto`);
const opPath = `${process.cwd()}/dist/ng-bundle`;
const copyCssFiles = (hash, updatedFilenames) => {
    const filename = 'wm-styles.css';
    const updatedFilename = `wm-styles.${hash}.css`
    copyFile(`${opPath}/${filename}`, `${opPath}/${updatedFilename}`);
    updatedFilenames[filename] = updatedFilename;
    // copyFile(`${opPath}/wm-styles.br.css`,`${opPath}/wm-styles.${hash}.br.css`);
    // copyFile(`${opPath}/wm-styles.gzip.css`,`${opPath}/wm-styles.${hash}.gzip.css`);
};
const copyMobileCssFiles = (hash, fileName) => {
    // const name = filePath.split('.css')[0];
    copyFile(`${opPath}/${fileName}.css`, `${opPath}/${fileName}.${hash}.css`);
    // copyFile(`${opPath}/wm-styles.br.css`,`${opPath}/wm-styles.${hash}.br.css`);
    // copyFile(`${opPath}/wm-styles.gzip.css`,`${opPath}/wm-styles.${hash}.gzip.css`);
};
const generateHash = async (filepath) => {
    const cssContent = await readFile(filepath);
    let hash = crypto.createHash('md5');
    hash.update(cssContent);
    return hash.digest('hex');
};
const generateHashForScripts = (updatedFilenames) => {
    const scriptsMap = {};
    return new Promise(resolve => {
        fs.readdir(opPath, (err, items) => {
            const promises = items.map(i => {
                const nohashIndex = i.indexOf('-NOHASH.js');
                if (nohashIndex > 0) {
                    const key = i.substring(0, nohashIndex);
                    return generateHash(`${opPath}/${i}`).then(hash => {
                        const filename = `${key}-NOHASH.js`;
                        const updatedFilename = `${key}.${hash}.js`
                        scriptsMap[`${key}.js`] = updatedFilename;
                        updatedFilenames[filename] = updatedFilename;
                        return Promise.all([
                            copyFile(`${opPath}/${filename}`, `${opPath}/${updatedFilename}`),
                            // copyFile(`${opPath}/${key}-NOHASH.br.js`, `${opPath}/${key}.${hash}.br.js`),
                            // copyFile(`${opPath}/${key}-NOHASH.gzip.js`, `${opPath}/${key}.${hash}.gzip.js`)
                        ]);
                    });
                }
            });
            Promise.all(promises).then(() => {
                return writeFile(`${opPath}/path_mapping.json`, JSON.stringify(scriptsMap, null, 2));
            }).then(resolve);
        });
    });
};
let isMobileProject = false;
let isProdBuild;
let isDevBuild;
let $;

const setMobileProjectType = (angularJson) => {
    let styles = angularJson['projects']['angular-app']['architect']['build']['options']['styles'];
    const androidStyles = styles.find((style) => {
        let isObject = typeof (style) === 'object';
        if (isObject) {
            return style.bundleName === 'wm-android-styles';
        }
        return false;
    });
    isMobileProject = androidStyles ? true : false;
    return isMobileProject;
}
const addMobileSpecificStyles = async (deployUrl) => {
    if (isDevBuild) {
        $("body").append(
            `<script> const WMStylesPath ="${deployUrl}/wm-android-styles.js" </script>`
        )
    }

    if (isProdBuild) {
        let hash = await generateHash(`${opPath}/wm-android-styles.css`);
        copyMobileCssFiles(hash, 'wm-android-styles');
        $("head").append(
            `<link rel="stylesheet" theme="wmtheme" href="${deployUrl}/wm-android-styles.${hash}.css" >`
        );
        hash = await generateHash(`${opPath}/wm-ios-styles.css`);
        copyMobileCssFiles(hash, 'wm-ios-styles');
        $("head").append(
            `<link rel="stylesheet" theme="wmtheme" href="${deployUrl}/wm-ios-styles.${hash}.css" >`
        );
    }
}

const addScriptForWMStylesPath = () => {
    // Add print css on load
    $("body").append(`<script>
            (function () {
                if (typeof WMStylesPath !== "undefined") {
                    let styleType = WMStylesPath.split(".").pop();
                    let styleNode;
                    if(styleType==="css"){
                        styleNode = document.createElement("link");
                        styleNode.type = "text/css";
                        styleNode.rel = "stylesheet";
                        styleNode.href = WMStylesPath;
                    }
                    else if(styleType==="js"){
                        styleNode = document.createElement("script");
                        styleNode.type = "text/javascript";
                        styleNode.src = WMStylesPath;
                        styleNode.defer = true;
                    }

                    styleNode && document
                        .getElementsByTagName("head")[0]
                        .appendChild(styleNode);
                }
            })()
            window.onload = function() {
                 var printCssNode = document.createElement('link');
                 printCssNode.type = 'text/css';
                 printCssNode.rel = 'stylesheet';
                 printCssNode.href = 'print.css';
                 printCssNode.media = 'print';
                 document.getElementsByTagName("head")[0].appendChild(printCssNode);
             }
            </script>`);
}

/**
 * Read the console arguments and prepare the key value pairs.
 * @returns Object console arguments as key value pairs
 */
const getArgs = (customArgs) => {
    const args = {};
    let arguments = customArgs || process.argv;
    arguments.slice(2, process.argv.length)
        .forEach(arg => {
            if (arg.slice(0, 2) === '--') {
                const longArg = arg.split('=');
                const longArgFlag = longArg[0].slice(2, longArg[0].length);
                const longArgValue = longArg.length > 2 ? longArg.slice(1, longArg.length).join('=') : longArg[1];
                args[longArgFlag] = longArgValue;
            }
        });
    return args;
}

const args = getArgs();

// Files that are moved out of ng-bundle and hence not to be updated.
const SKIP_UPDATE = ['index.html', 'manifest.json'];

/**
 * Checks if a file's name has been changed during the build process
 * and if changed, returns an updated file path.
 * 
 * @param {string} deployUrl deployment url
 * @param {string} url an absolute url to check if its filename has changed 
 * @param {object} updatedFileNames a map from old filenames to new filenames
 * @returns {string} an updated file path
 */
const getUpdatedFileName = (deployUrl, url, updatedFileNames) => {
    const absUrl = url.substring(1); // remove leading '/'
    if (SKIP_UPDATE.includes(absUrl)) {
        return absUrl;
    }

    if (absUrl in updatedFileNames) {
        return `${deployUrl}/${updatedFileNames[absUrl]}` // add the leading '/' back
    }
    return `${deployUrl}${url}`;
}

/**
 * Checks if a file's content has been changed during the build process
 * and if changed, returns a new hash to be updated in ngsw.json
 * 
 * @param {string} url an absolute url to check if its filename has changed 
 * @param {object} updatedFileHashes a map from filenames to file hashes
 * @returns {string} an updated file hash
 */
const getUpdatedFileHashes = (url, oldHash, updatedFileHashes) => {
    const absUrl = url.substring(1); // remove leading '/'
    if (absUrl in updatedFileHashes) {
        return updatedFileHashes[absUrl];
    }
    return oldHash;
}

/**
 * Get the path of the icon without '/ng-bundle'
 * 
 * @param {string} iconPath path with '/ng-bundle'
 * @returns {string} path of the icon without '/ng-bundle'
 */
const getIconPath = (iconPath) => {
    var index = iconPath.indexOf("/", iconPath.indexOf("/") + 1);
    return iconPath.substring(index + 1);
}

/**
 * Updates name, location and content of PWA related assets.
 * 
 * @param {string} deployUrl deployment url
 * @param {object} updatedFileNames a map from old filenames to new filenames
 * @returns {void}
 */
const updatePwaAssets = (deployUrl, updatedFileNames, updatedFileHashes) => {
    const ngswPath = './dist/ngsw.json';
    const manifestPath = './dist/manifest.json';

    // copy service worker and its config to root directory
    fs.copyFileSync('./dist/ng-bundle/ngsw-worker.js', './dist/ngsw-worker.js');
    fs.copyFileSync('./dist/ng-bundle/ngsw.json', ngswPath);
    fs.copyFileSync('./dist/ng-bundle/manifest.json', manifestPath);

    // update the icons url in manifest.json
    const manifest = JSON.parse(fs.readFileSync(manifestPath).toString());
    const updatedManifest = {
        ...manifest,
        icons: manifest.icons.map(icon => ({ ...icon, src: `${deployUrl}/${getIconPath(icon.src)}` })),
    }
    const manifestContent = JSON.stringify(updatedManifest, null, 4);
    fs.writeFileSync(manifestPath, manifestContent);

    // edit service worker config to include ./ng-bundle to the path of files to be cached
    // also update the urls to files whose names are modified to include file hash (wm-styles)
    const ngswData = JSON.parse(fs.readFileSync(ngswPath).toString());
    ngswData.assetGroups = ngswData.assetGroups.map(group => ({
        ...group,
        urls: group.urls.map(url => getUpdatedFileName(deployUrl, url, updatedFileNames))
    }));
    ngswData.hashTable = Object.keys(ngswData.hashTable).reduce((prev, current) => ({
        ...prev,
        [getUpdatedFileName(deployUrl, current, updatedFileNames)]: getUpdatedFileHashes(current, ngswData.hashTable[current], updatedFileHashes),
    }), {});

    const ngswContent = JSON.stringify(ngswData, null, 4);
    fs.writeFileSync(ngswPath, ngswContent);
}

/**
 * Generated sha1 hash for the content supplied.
 * 
 * @param {string} content the content to be hashed
 * @returns {string} the hash value
 */
const generateSha1 = (content) => {
    const buffer = Buffer.from(content, 'utf8');
    return crypto.createHash('sha1').update(buffer).digest("hex");
}

(async () => {
    try {
        const angularJson = require(`${process.cwd()}/angular.json`);
        const build = angularJson['projects']['angular-app']['architect']['build'];
        let deployUrl = args['deploy-url'] || build['options']['deployUrl'];
        if (deployUrl.endsWith('/')) {
            deployUrl = deployUrl.slice(0, deployUrl.length - 1);
        }

        fs.copyFileSync('./dist/ng-bundle/index.html', './dist/index.html');
        const contents = await readFile(`./dist/index.html`, `utf8`);
        $ = cheerio.load(contents);
        $('script').attr('defer', 'true');
        setMobileProjectType(angularJson);
        if (!isMobileProject) {
            isProdBuild = fs.existsSync(`${process.cwd()}/dist/ng-bundle/wm-styles.css`);
            isDevBuild = fs.existsSync(`${process.cwd()}/dist/ng-bundle/wm-styles.js`);
        } else {
            isDevBuild = fs.existsSync(`${process.cwd()}/dist/ng-bundle/wm-android-styles.js`);
            isProdBuild = fs.existsSync(`${process.cwd()}/dist/ng-bundle/wm-android-styles.css`);
            $("script[type='module']").remove();
            $('script[nomodule]').removeAttr('nomodule');
        }

        if (isProdBuild) {
            const isOptimizeCss = $('meta[optimizecss]').length;
            if (isOptimizeCss) {
                console.log(`CSS Optimization Selected`);
                const { stdout, stderr } = await exec(`npm run optimizecss`);
                console.log(`Optimization Log | ${stdout}`);
                console.error(`Optimization Error | ${stderr}`);
            }
        }
        // if service worker is enabled the app is a PWA
        const serviceWorkerEnabled = build['configurations']['production']['serviceWorker'];
        const updatedFilenames = {}
        const updatedFileHashes = {}

        if (isMobileProject) {
            await addMobileSpecificStyles(deployUrl);
        } else {
            if (isDevBuild) {
                $("head").append(
                    `<script> const WMStylesPath = "${deployUrl}/wm-styles.js" </script>`
                )
            } else {
                const fileName = 'wm-styles';
                const hash = await generateHash(`${opPath}/${fileName}.css`);
                copyCssFiles(hash, updatedFilenames);
                const updatedFileName = `${fileName}.${hash}.css`
                $("head").append(
                    `<script> const WMStylesPath = "${deployUrl}/${updatedFileName}" </script>`
                );
            }
        }

        addScriptForWMStylesPath();
        const htmlContent = $.html();
        await writeFile(`./dist/index.html`, htmlContent);

        await generateHashForScripts(updatedFilenames);

        if (serviceWorkerEnabled) {
            // re-generate hash for index.html since its been modified
            updatedFileHashes['index.html'] = generateSha1(htmlContent);
            updatePwaAssets(deployUrl, updatedFilenames, updatedFileHashes);
        }
    } catch (e) {
        console.error(`Error in Post ng build Script | ${e}`);
    }
})();
