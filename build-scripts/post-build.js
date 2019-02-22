const util = require(`util`);
const fs = require(`fs`);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const cheerio = require(`cheerio`);
(async () => {
    try {
        const contents = await readFile(`./dist/index.html`, `utf8`);
        const $ = cheerio.load(contents);
        $('script').attr('defer', 'true');
        await writeFile(`./dist/index.html`, $.html())
    } catch (e) {
        console.error(`Error in Post ng build Script | ${e}`);
    }
})();
