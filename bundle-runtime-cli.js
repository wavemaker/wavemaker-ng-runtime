'use strict';
const fs = require('fs');

const ng9Log = ()=>{
    let log;
    return {
        log(str){
            log+=`\n * * * `
            log+=str;
        },
        store(){
            const logPath = './dist/runtime-cli/angular-app/logger.json';
            fs.appendFileSync(logPath, log);
        }
    }
};

const ng9Logger = ng9Log();

const argv = require("yargs")
.options({
    "updateWmVersion": {
        type: "boolean"
    },
    "useS3": {
        type: "boolean"
    },
    "version": {
        alias: "v",
        type: "string"
    }
}).argv;

ng9Logger.log('argv: '+ argv);
ng9Logger.log('argv.updateWmVersion: ' + argv['updateWmVersion']);
ng9Logger.log('argv.useS3: ' + argv['useS3']);
ng9Logger.log('argv.version: ' + argv['version']);


const generateNpmVersion = (version) => {
    ng9Logger.log('generateNpmVersion  |  version: '+ version);
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
    ng9Logger.log('generateNpmVersion  |  npmVer: '+ npmVer);
    return npmVer;
};


const updateWMVersion = () => {
    ng9Logger.log('updateWMVersion  |  begin ');
    const path = './libraries/package.json';
    const wmPackageJSON = require(path);
    wmPackageJSON.version = generateNpmVersion(argv.version);
    fs.writeFileSync(path, JSON.stringify(wmPackageJSON, null, 4));
    console.log(`Updated package.json wm:${argv.version} for publishing to npm`);
    ng9Logger.log('updateWMVersion  |  end  | argv.version:'+argv.version);
};

const addWMDependency = () => {
    ng9Logger.log('addWMDependency  |  begin ');
    const path = './dist/runtime-cli/angular-app/package.json';
    const packageJSON = require(path);
    if (argv.useS3) {
        ng9Logger.log('addWMDependency  |  useS3 : true ');
        packageJSON.dependencies.wm = `https://s3.amazonaws.com/npm.wavemaker.com/release/wm/${argv.version}/wm.tar.gz`;
        console.log(`Added wm dependency on s3 to angular app.`);
    } else {
        ng9Logger.log('addWMDependency  |  useS3 : false | argv.version: '+argv.version);
        packageJSON.dependencies.wm = generateNpmVersion(argv.version);
        console.log(`Added wm:${argv.version} dependency to angular app`);
    }
    fs.writeFileSync(path, JSON.stringify(packageJSON, null, 4));
    ng9Logger.log(` DONE | ADD_WM_DEPENDENCY`)
};

const updateAngularJSON = () => {
    ng9Logger.log(`updateAngularJSON | Begin`)
    const path = './dist/runtime-cli/angular-app/angular.json';
    const json = require(path);
    const scripts = json['projects']['angular-app']['architect']['build']['options']['scripts'];
    scripts.forEach((v, i) => {
        ng9Logger.log(`updateAngularJSON | scripts | ${v}`)
        if (v.startsWith('./libraries/')) {
            scripts[i] = v.replace('./libraries/', './node_modules/wm/');
            ng9Logger.log(`updateAngularJSON | scripts | REPLACED | ${scripts[i]}`)
        }
    });
    fs.writeFileSync(path, JSON.stringify(json, null, 4));
    ng9Logger.log(` DONE | UPDATE_NG_JSON`)
};

const updateTSConfig = (path) => {
    ng9Logger.log(`updateTSConfig | Begin`)
    const json = require(path);
    const paths = json['compilerOptions']['paths'];
    for (let key in paths) {
        const pathRefs = paths[key];
        
        pathRefs.forEach((v, i) => {
            ng9Logger.log(`updateTSConfig | pathRefs | ${v}`)
            if (v.startsWith('libraries/')) {
                pathRefs[i] = v.replace('libraries/', 'node_modules/wm/');
                ng9Logger.log(`updateTSConfig | pathRefs | REPLACED | ${pathRefs[i] }`)
            }
        });
    }
    fs.writeFileSync(path, JSON.stringify(json, null, 4));
    ng9Logger.log(`updateTSConfig | Done`)
};

const processRequest = () => {
    ng9Logger.log(`processRequest | Begin`)
    if (argv.updateWmVersion) {
        updateWMVersion();
        addWMDependency();
        updateAngularJSON();
        updateTSConfig('./dist/runtime-cli/angular-app/tsconfig.json');
        updateTSConfig('./dist/runtime-cli/angular-app/tsconfig.web-app.json');
    } else {
        console.log('There is no task to execute for the given command.');
    }
    ng9Logger.log(`processRequest | Done`)
};

processRequest();

ng9Logger.store();
