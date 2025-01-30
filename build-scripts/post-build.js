const util = require(`util`);
const fs = require('fs-extra');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const copyFile = util.promisify(fs.copyFile);
const exec = util.promisify(require('child_process').exec);
const cheerio = require(`cheerio`);
const crypto = require(`crypto`);

const copyCssFiles = (hash, updatedFilenames) => {
    const filename = 'wm-styles.css';
    const updatedFilename = `wm-styles.${hash}.css`
    copyFile(`${global.opPath}/${filename}`, `${global.opPath}/${updatedFilename}`);
    updatedFilenames[filename] = updatedFilename;
    // copyFile(`${opPath}/wm-styles.br.css`,`${opPath}/wm-styles.${hash}.br.css`);
    // copyFile(`${opPath}/wm-styles.gzip.css`,`${opPath}/wm-styles.${hash}.gzip.css`);
};
const copyMobileCssFiles = (hash, fileName) => {
    // const name = filePath.split('.css')[0];
    copyFile(`${global.opPath}/${fileName}.css`, `${global.opPath}/${fileName}.${hash}.css`);
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
    //from angular 12(IVY), scripts array in angular json, doesn't allow `@` symbol in the name/value
    //so removed `@` from wavemaker.com in the file name and adding it back in the post-build.js file
    const scriptsMap = {};
    return new Promise(resolve => {
        fs.readdir(global.opPath, (err, items) => {
            const promises = items.map(i => {
                const nohashIndex = i.indexOf('-NOHASH.js');
                if (nohashIndex > 0) {
                    const key = i.substring(0, nohashIndex);
                    return generateHash(`${global.opPath}/${i}`).then(hash => {
                        const filename = `${key}-NOHASH.js`;
                        const updatedFilename = `${key}.${hash}.js`
                        scriptsMap[`${key}.js`] = updatedFilename;
                        updatedFilenames[filename] = updatedFilename;
                        return Promise.all([
                            copyFile(`${global.opPath}/${filename}`, `${global.opPath}/${updatedFilename}`),
                            // copyFile(`${opPath}/${key}-NOHASH.br.js`, `${opPath}/${key}.${hash}.br.js`),
                            // copyFile(`${opPath}/${key}-NOHASH.gzip.js`, `${opPath}/${key}.${hash}.gzip.js`)
                        ]);
                    });
                }
            });
            Promise.all(promises).then(() => {
                return writeFile(`${global.opPath}/path_mapping.json`, JSON.stringify(scriptsMap, null, 2));
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
            `<script type="text/javascript" defer="true" src="${deployUrl}wm-android-styles.js"></script>`
        );
    }

    if (isProdBuild) {
        let hash = await generateHash(`${global.opPath}/wm-android-styles.css`);
        copyMobileCssFiles(hash, 'wm-android-styles');
        $("head").append(
            `<link rel="stylesheet" theme="wmtheme" href="${deployUrl}wm-android-styles.${hash}.css" >`
        );
        hash = await generateHash(`${global.opPath}/wm-ios-styles.css`);
        copyMobileCssFiles(hash, 'wm-ios-styles');
        $("head").append(
            `<link rel="stylesheet" theme="wmtheme" href="${deployUrl}wm-ios-styles.${hash}.css" >`
        );
    }
}

const addScriptForWMStylesPath = (wm_styles_path) => {
    // wm_styles_path will not be present for mobile apps
    if (wm_styles_path) {
        let styleType = wm_styles_path.split(".").pop();
        if(styleType==="css"){
            $("head").append(
                `<link rel="stylesheet" type="text/css" href="${wm_styles_path}"/>`
            );
        } else {
            $("body").append(
                `<script type="text/javascript" defer="true" src="${wm_styles_path}"></script>`
            );
        }
    }
}
const addPrintStylesPath = (print_styles_path) => {
    $("head").append(
        `<link rel="stylesheet" type="text/css" media="print" href="${print_styles_path}"/>`
    );
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
        return `${deployUrl}${updatedFileNames[absUrl]}` // add the leading '/' back
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
    //this is always from server in case of pwa. Need to fix this to use cdnurl from runtime/build config
    deployUrl = deployUrl === "_cdnUrl_" ? 'ng-bundle/' : deployUrl;

    // copy service worker and its config to root directory
    fs.copyFileSync('./dist/ng-bundle/ngsw-worker.js', './dist/ngsw-worker.js');
    fs.copyFileSync('./dist/ng-bundle/wmsw-worker.js', './dist/wmsw-worker.js');
    fs.copyFileSync('./dist/ng-bundle/ngsw.json', ngswPath);
    fs.copyFileSync('./dist/ng-bundle/manifest.json', manifestPath);

    // update the icons url in manifest.json
    const manifest = JSON.parse(fs.readFileSync(manifestPath).toString());
    const updatedManifest = {
        ...manifest,
        icons: manifest.icons.map(icon => ({ ...icon, src: `${deployUrl}${getIconPath(icon.src)}` })),
    }
    const manifestContent = JSON.stringify(updatedManifest, null, 4);
    fs.writeFileSync(manifestPath, manifestContent);
    updatedFileHashes['manifest.json'] = generateSha1(manifestContent);

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
        global.randomHash = deployUrl.split('/')[1];
        let outputPath = global.opPath = args['output-path'] || build['options']['outputPath']
        const contents = await readFile(`./dist/index.html`, `utf8`);
        $ = cheerio.load(contents);
        setMobileProjectType(angularJson);
        if (!isMobileProject) {
            isProdBuild = fs.existsSync(`${process.cwd()}/${outputPath}/wm-styles.css`);
            isDevBuild = fs.existsSync(`${process.cwd()}/${outputPath}/wm-styles.js`);
        } else {
            isDevBuild = fs.existsSync(`${process.cwd()}/${outputPath}/wm-android-styles.js`);
            isProdBuild = fs.existsSync(`${process.cwd()}/${outputPath}/wm-android-styles.css`);
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
        let wm_styles_path;

        if (isMobileProject) {
            await addMobileSpecificStyles(deployUrl);
        } else {
            if (isDevBuild) {
                wm_styles_path = `${deployUrl}wm-styles.js`;
            } else {
                const fileName = 'wm-styles';
                const hash = await generateHash(`${global.opPath}/${fileName}.css`);
                copyCssFiles(hash, updatedFilenames);
                const updatedFileName = `${fileName}.${hash}.css`
                wm_styles_path = `${deployUrl}${updatedFileName}`;
            }
        }

        addScriptForWMStylesPath(wm_styles_path);
        addPrintStylesPath(`${deployUrl}print.css`);

        //this is required to download all the assets
        $('head').append(`<meta name="deployUrl" content=${deployUrl} />`);
        $('script[src$="services/application/wmProperties.js"]').remove();
        $('link[href$="favicon.png"]').attr('href', `${deployUrl}favicon.png`);

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
