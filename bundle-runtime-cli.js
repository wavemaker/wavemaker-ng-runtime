
/**
 * To update the @wavemaker/app-ng-runtime package.json version 
 * Add the dependency of @wavemaker/app-ng-runtime in package.json file
 * Update the TS config and TS config web app json with package version
 *  
 * CONSOLE ARGUMENTS:-
 *  publishVersion: To generate the given version package.json file
 */
'use strict';
const fs = require('fs');

const argv = require("yargs")
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
 * To add the app-ng-runtime package as dependency in angular app package.json
 * @param {*} wm_pkg_name  ng runtime pm package name @wavemaker/app-ng-runtime
 */
const addWMDependency = (wm_pkg_name) => {
    const path = './dist/runtime-cli/angular-app/package.json';
    const packageJSON = require(path);

    packageJSON.dependencies[wm_pkg_name] = argv.publishVersion;
    console.log(`${DEBUG_LOG} Added ${wm_pkg_name}:${argv.publishVersion} dependency to angular app`);

    fs.writeFileSync(path, JSON.stringify(packageJSON, null, 4));
};

/**
 * To replace the libraries with node_modules path in angular.json   
 * @param {*} wm_pkg_name  ng runtime pm package name @wavemaker/app-ng-runtime
 */
const updateAngularJSON = (wm_pkg_name) => {
    const path = './dist/runtime-cli/angular-app/angular.json';
    const json = require(path);
    const scripts = json['projects']['angular-app']['architect']['build']['options']['scripts'];
    scripts.forEach((v, i) => {
        if (v.startsWith('./libraries/')) {
            scripts[i] = v.replace('./libraries/', `./node_modules/${wm_pkg_name}/`);
        }
    });
    fs.writeFileSync(path, JSON.stringify(json, null, 4));
};

/**
 *  To update the app-ng-runtime package in TS config
 * @param {*} path TS Config path
 * @param {*} wm_pkg_name ng runtime pm package name @wavemaker/app-ng-runtime
 */
const updateTSConfig = (path, wm_pkg_name) => {
    const json = require(path);
    const paths = json['compilerOptions']['paths'];
    for (let key in paths) {
        const pathRefs = paths[key];
        pathRefs.forEach((v, i) => {
            if (v.startsWith('libraries/')) {
                pathRefs[i] = v.replace('libraries/', `node_modules/${wm_pkg_name}/`);
            }
        });
    }
    fs.writeFileSync(path, JSON.stringify(json, null, 4));
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
    const wm_pkg_name = wmPackageJSON.name || '@wavemaker/app-ng-runtime';
    updateWMVersion(path, wmPackageJSON);
    addWMDependency(wm_pkg_name);
    updateAngularJSON(wm_pkg_name);
    updateTSConfig('./dist/runtime-cli/angular-app/tsconfig.json', wm_pkg_name);
    updateTSConfig('./dist/runtime-cli/angular-app/tsconfig.web-app.json', wm_pkg_name);
};

init();
