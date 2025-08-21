
/**
 * To update the @wavemaker/app-ng-runtime package.json version
 * Add the dependency of @wavemaker/app-ng-runtime in package.json file
 * Update the TS config and TS config web app json with package version
 *
 * CONSOLE ARGUMENTS:-
 *  publishVersion: To generate the given version package.json file
 */
'use strict';
import fs from 'fs';
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
    .options({
        "publishVersion": {
            type: "string"
        }
    }).argv;

const DEBUG_LOG = 'NG-RUNTIME: ';

/**
 * To update the wavemaker version in package.json
 */
const updateWMVersion = (path, wmPackageJSON) => {
    wmPackageJSON.version = argv.publishVersion;
    fs.writeFileSync(path, JSON.stringify(wmPackageJSON, null, 4));
    console.log(`${DEBUG_LOG} Updated package.json wm:${argv.publishVersion} for publishing to npm`);
};

/**
 * Update the wavemaker version
 * Add wavemaker dependency
 * Update packagename and version in the angular.json
 * Update TS config with package name
 */
const init = () => {
    const path = './libraries/package.json';
    const wmPackageJSON = require(path);
    updateWMVersion(path, wmPackageJSON);
};

init();
