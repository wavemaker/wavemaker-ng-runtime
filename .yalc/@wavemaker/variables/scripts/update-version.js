'use strict';
var fs = require('fs');
var yargs = require('yargs');
var argv = yargs(process.argv).argv;
/**
 * To add the app-ng-runtime package as dependency in angular app package.json
 * @param {*} wm_pkg_name  ng runtime pm package name @wavemaker/app-ng-runtime
 */
var updateVariablesPackage = function (path) {
    if (fs.existsSync(path)) {
        var packageJSON = require('../' + path);
        packageJSON['dependencies']['@wavemaker/variables'] = argv["publish-version"];
        fs.writeFileSync(path, JSON.stringify(packageJSON, null, 4));
    }
    else {
        console.log('package.json not found at ' + path);
    }
};
var init = function () {
    updateVariablesPackage('../wavemaker-ng-runtime/package.json');
    updateVariablesPackage('../wavemaker-rn-runtime/package.json');
    updateVariablesPackage('../wavemaker-rn-codegen/src/templates/project/package.json');
};
init();
//# sourceMappingURL=update-version.js.map