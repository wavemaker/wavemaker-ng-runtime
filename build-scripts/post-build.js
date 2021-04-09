const util = require(`util`);
const fs = require('fs-extra');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const copyFile = util.promisify(fs.copyFile);
const exec = util.promisify(require('child_process').exec);
const cheerio = require(`cheerio`);
const crypto = require(`crypto`);
const opPath = `${process.cwd()}/dist/ng-bundle`;
const copyCssFiles = (hash)=>{
    copyFile(`${opPath}/wm-styles.css`,`${opPath}/wm-styles.${hash}.css`);
    // copyFile(`${opPath}/wm-styles.br.css`,`${opPath}/wm-styles.${hash}.br.css`);
    // copyFile(`${opPath}/wm-styles.gzip.css`,`${opPath}/wm-styles.${hash}.gzip.css`);
};
const copyMobileCssFiles = (hash, fileName)=>{
    // const name = filePath.split('.css')[0];
    copyFile(`${opPath}/${fileName}.css`,`${opPath}/${fileName}.${hash}.css`);
    // copyFile(`${opPath}/wm-styles.br.css`,`${opPath}/wm-styles.${hash}.br.css`);
    // copyFile(`${opPath}/wm-styles.gzip.css`,`${opPath}/wm-styles.${hash}.gzip.css`);
};
const generateHash = async (filepath)=>{
    const cssContent = await readFile(filepath);
    let hash = crypto.createHash('md5');
    hash.update(cssContent);
    return hash.digest('hex');
};
const generateHashForScripts = () => {
    const scriptsMap = {};
    return new Promise(resolve => {
        fs.readdir(opPath, (err, items) => {
            const promises = items.map(i => {
                const nohashIndex = i.indexOf('-NOHASH.js');
                if (nohashIndex > 0) {
                    const key = i.substring(0, nohashIndex);
                    return generateHash(`${opPath}/${i}`).then( hash => {
                        scriptsMap[`${key}.js`] = `${key}.${hash}.js`;
                        return Promise.all([
                            copyFile(`${opPath}/${key}-NOHASH.js`, `${opPath}/${key}.${hash}.js`),
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
    const androidStyles =  styles.find((style) => {
        let isObject = typeof (style) === 'object';
        if (isObject) {
            return style.bundleName === 'wm-android-styles';
        }
        return false;
    });
    isMobileProject = androidStyles ? true: false;
    return isMobileProject;
}
const addMobileSpecificStyles = async(deployUrl) => {
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

(async () => {
    try {
        const angularJson = require(`${process.cwd()}/angular.json`);
        let deployUrl = angularJson['projects']['angular-app']['architect']['build']['options']['deployUrl'];
        if (deployUrl.endsWith('/')) {
            deployUrl = deployUrl.substr(0, deployUrl.length - 1);
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
        }

            if(isProdBuild){
                const isOptimizeCss = $('meta[optimizecss]').length;
                if(isOptimizeCss){
                    console.log(`CSS Optimization Selected`);
                    const {stdout,stderr} = await exec(`npm run optimizecss`);
                    console.log(`Optimization Log | ${stdout}`);
                    console.error(`Optimization Error | ${stderr}`);
                }
            }

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
                copyCssFiles(hash);
                $("head").append(
                    `<script> const WMStylesPath = "${deployUrl}/${fileName}.${hash}.css" </script>`
                );
            }
        let styles = angularJson['projects']['angular-app']['architect']['build']['options']['styles'];
        for (const style of styles) {
            let isStyleObject = typeof (style) === "object";
            if (isStyleObject && style.input && style.bundleName) {
                if (style.input.includes('themes') && style.bundleName.startsWith('mobile_')) {
                    if(isDevBuild) {
                        let themePathName = 'WMAndroidThemesPath';
                        if (style.bundleName.endsWith('_ios')) {
                            themePathName = 'WMiOSThemesPath';
                        }
                        $("head").append(
                            `<script> const ${themePathName} = "${deployUrl}/${style.bundleName}.js" </script>`
                        )
                    }
                    if (isProdBuild) {
                        const hash = await generateHash(`${opPath}/${style.bundleName}.css`);
                        copyMobileCssFiles(hash, style.bundleName);
                        $("body").append(
                            `<link rel="stylesheet" theme="wmtheme" href="${deployUrl}/${style.bundleName}.${hash}.css" >`
                        )
                    }
                }
            }
        };
        await writeFile(`./dist/index.html`, $.html());
        generateHashForScripts();
    }
 } catch (e) {
        console.error(`Error in Post ng build Script | ${e}`);
    }
})();
