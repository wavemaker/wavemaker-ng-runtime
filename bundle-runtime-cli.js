
/**
 * To update the @wavemaker/app-ng-runtime package.json version 
 * Add the dependency of @wavemaker/app-ng-runtime in package.json file
 * Update the TS config and TS config web app json with package version
 *  
 * CONSOLE ARGUMENTS:-
 *  isProd:         To decide the version format (10.6.4-next.139401 / 10.6.4-rc.139401)
 *  publishVersion: To generate the given version package.json file
 */
'use strict';
const fs = require('fs');

const argv = require("yargs")
    .options({
        "isProd": {
            type: "boolean"
        },
        "publishVersion": {
            type: "string"
        }
    }).argv;

const DEBUG_LOG = 'NG-RUNTIME: ';

/**
 * Generate the npm package version to publish into the npm package.
 * @param {*} publishVersion  
 * @returns string foramt npm version
 */
const generateNpmVersion = (publishVersion) => {
    publishVersion = publishVersion || '';
    const splits = publishVersion.split('.');
    while (splits.length < 4) {
        splits.push('0');
    }
    let npmVer = '';
    splits.forEach((v, i) => {
        if (i === 3) {
            npmVer += `-${(argv.isProd ? 'rc' : 'next')}.`;
        } else if (i > 0) {
            npmVer += '.';
        }
        npmVer += v;
    });
    return npmVer;
};


/**
 * To update the wavemaker version in package.json
 */
const updateWMVersion = () => {
    const path = './libraries/package.json';
    const wmPackageJSON = require(path);
    wmPackageJSON.version = generateNpmVersion(argv.publishVersion);
    fs.writeFileSync(path, JSON.stringify(wmPackageJSON, null, 4));
    console.log(`${DEBUG_LOG} Updated package.json wm:${argv.publishVersion} for publishing to npm`);
};

/**
 * To add the app-ng-runtime package as dependency in angular app package.json
 * @param {*} wm_pkg_name  ng runtime pm package name @wavemaker/app-ng-runtime
 */
const addWMDependency = (wm_pkg_name = `@wavemaker/app-ng-runtime`) => {
    const path = './dist/runtime-cli/angular-app/package.json';
    const packageJSON = require(path);

    packageJSON.dependencies[wm_pkg_name] = generateNpmVersion(argv.publishVersion);
    console.log(`${DEBUG_LOG} Added ${wm_pkg_name}:${argv.publishVersion} dependency to angular app`);

    fs.writeFileSync(path, JSON.stringify(packageJSON, null, 4));
};

/**
 * To replace the libraries with node_modules path in angular.json   
 * @param {*} wm_pkg_name  ng runtime pm package name @wavemaker/app-ng-runtime
 */
const updateAngularJSON = (wm_pkg_name = `@wavemaker/app-ng-runtime`) => {
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
const updateTSConfig = (path, wm_pkg_name = `@wavemaker/app-ng-runtime`) => {
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

const init = () => {
    const wm_pkg_name = `@wavemaker/app-ng-runtime`;
    updateWMVersion();
    addWMDependency(wm_pkg_name);
    updateAngularJSON(wm_pkg_name);
    updateTSConfig('./dist/runtime-cli/angular-app/tsconfig.json', wm_pkg_name);
    updateTSConfig('./dist/runtime-cli/angular-app/tsconfig.web-app.json', wm_pkg_name);
};

init();
