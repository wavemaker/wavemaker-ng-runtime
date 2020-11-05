'use strict';
const fs = require('fs');

const argv = require("yargs")
.options({
    "updateWmVersion": {
        type: "boolean"
    },
    "useS3": {
        type: "boolean"
    },
    "useNpm": {
        type: "boolean"
    },
    "isProd": {
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
            npmVer += `-${(argv.isProd?'rc':'next')}.`;
        } else if (i > 0) {
            npmVer += '.';
        }
        npmVer += v;
    });
    return npmVer;
};


const updateWMVersion = () => {
    const path = './libraries/package.json';
    const wmPackageJSON = require(path);
    wmPackageJSON.version = generateNpmVersion(argv.version);
    fs.writeFileSync(path, JSON.stringify(wmPackageJSON, null, 4));
    console.log(`Updated package.json wm:${argv.version} for publishing to npm`);
};

const addWMDependency = (wm_pkg_name=`@wavemaker/app-ng-runtime`) => {
    const path = './dist/runtime-cli/angular-app/package.json';
    const packageJSON = require(path);

    if(argv.useNpm){
        packageJSON.dependencies[wm_pkg_name] = generateNpmVersion(argv.version);
        console.log(`Added ${wm_pkg_name}:${argv.version} dependency to angular app`);
    } 

    // if (argv.useS3) {
    //     packageJSON.dependencies.wm = `https://s3.amazonaws.com/npm.wavemaker.com/release/wm/${argv.version}/wm.tar.gz`;
    //     console.log(`Added wm dependency on s3 to angular app.`);
    // } else {
    //     packageJSON.dependencies.wm = generateNpmVersion(argv.version);
    //     console.log(`Added wm:${argv.version} dependency to angular app`);
    // }

    fs.writeFileSync(path, JSON.stringify(packageJSON, null, 4));
};

const updateAngularJSON = (wm_pkg_name=`@wavemaker/app-ng-runtime`) => {
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

const updateTSConfig = (path, wm_pkg_name=`@wavemaker/app-ng-runtime`) => {
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

const processRequest = () => {
    if (argv.updateWmVersion) {
        const wm_pkg_name = `@wavemaker/app-ng-runtime`;
        updateWMVersion();
        addWMDependency(wm_pkg_name);
        updateAngularJSON(wm_pkg_name);
        updateTSConfig('./dist/runtime-cli/angular-app/tsconfig.json',wm_pkg_name);
        updateTSConfig('./dist/runtime-cli/angular-app/tsconfig.web-app.json',wm_pkg_name);
    } else {
        console.log('There is no task to execute for the given command.');
    }
};

processRequest();
