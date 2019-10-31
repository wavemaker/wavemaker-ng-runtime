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
    copyFile(`${opPath}/wm-styles.br.css`,`${opPath}/wm-styles.${hash}.br.css`);
    copyFile(`${opPath}/wm-styles.gzip.css`,`${opPath}/wm-styles.${hash}.gzip.css`);
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
                            copyFile(`${opPath}/${key}-NOHASH.br.js`, `${opPath}/${key}.${hash}.br.js`),
                            copyFile(`${opPath}/${key}-NOHASH.gzip.js`, `${opPath}/${key}.${hash}.gzip.js`)
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
(async () => {
    try {
        fs.copyFileSync('./dist/ng-bundle/index.html', './dist/index.html');
        const contents = await readFile(`./dist/index.html`, `utf8`);
        const $ = cheerio.load(contents);
        $('script').attr('defer', 'true');
        isProdBuild = fs.existsSync(`${process.cwd()}/dist/ng-bundle/wm-styles.css`);
        isDevBuild = fs.existsSync(`${process.cwd()}/dist/ng-bundle/wm-styles.js`);
            if(isDevBuild){
                $("head").append(
                    `<script> const WMStylesPath = "ng-bundle/wm-styles.js" </script>`
                )
            }
            if(isProdBuild){
                const isOptimizeCss = $('meta[optimizecss]').length;
                if(isOptimizeCss){
                    console.log(`CSS Optimization Selected`);
                    const {stdout,stderr} = await exec(`npm run optimizecss`);
                    console.log(`Optimization Log | ${stdout}`);
                    console.error(`Optimization Error | ${stderr}`);
                }
                const hash = await generateHash(`${opPath}/wm-styles.css`);
                copyCssFiles(hash);
                $("head").append(
                    `<script> const WMStylesPath = "ng-bundle/wm-styles.${hash}.css" </script>`
                );
            }
        await writeFile(`./dist/index.html`, $.html());
        generateHashForScripts();
    } catch (e) {
        console.error(`Error in Post ng build Script | ${e}`);
    }
})();
