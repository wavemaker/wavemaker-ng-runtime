'use strict';
const fs = require('fs');
const yargs = require('yargs');
const argv = yargs(process.argv).argv;

/**
 * Updates the @wavemaker/app-ng-runtime dependency in the specified package.json file.
 * @param {string} path - The path to the package.json file to update.
 */

const updateNgRuntimePackage = (path) => {
    if (fs.existsSync(path)) {
        const packageJSON = require('../' + path);
        packageJSON['dependencies']['@wavemaker/app-ng-runtime'] = argv["publish-version"];
        fs.writeFileSync(path, JSON.stringify(packageJSON, null, 4));
    } else {
        console.log('package.json not found at ' + path);
    }
};
const init = () => {
    updateNgRuntimePackage('../wavemaker-studio-runtime-integration/package.json');
};

init();
