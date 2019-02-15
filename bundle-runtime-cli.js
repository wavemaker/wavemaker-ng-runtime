'use strict';
const fs = require('fs');

const argv = require("yargs")
.options({
    "updateWmVersion": {
        type: "boolean"
    },
    "version": {
        alias: "v",
        type: "string"
    }
}).argv;

const generateNpmVersion = (version) => {
    version = version || '';
    const splits = version.split('.');
    while (splits.length < 4) {
        splits.push('0');
    }
    let npmVer = '';
    splits.forEach((v, i) => {
        if (i === 3) {
            npmVer += '-rc.';
        } else if (i > 0) {
            npmVer += '.';
        }
        npmVer += v;
    });
    return npmVer;
};

argv.version = generateNpmVersion(argv.version);

const updateWMVersion = () => {
    const path = './dist/npm-packages/wm/package.json';
    const wmPackageJSON = require(path);
    wmPackageJSON.version = argv.version;
    fs.writeFileSync(path, JSON.stringify(wmPackageJSON, null, 4));
    console.log(`Updated package.json wm:${argv.version} for publishing to npm`);
};

const addWMDependency = () => {
    const path = './dist/runtime-cli/angular-app/package.json';
    const packageJSON = require(path);
    packageJSON.dependencies.wm = argv.version;
    fs.writeFileSync(path, JSON.stringify(packageJSON, null, 4));
    console.log(`Added wm:${argv.version} dependency to angular app`);
};

const processRequest = () => {
    if (argv.updateWmVersion) {
        updateWMVersion();
        addWMDependency();
    } else {
        console.log('There is no task to execute for the given command.');
    }
};

processRequest();
