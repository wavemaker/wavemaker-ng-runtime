'use strict';
const fs = require('fs');
const yargs = require('yargs');
const argv = yargs(process.argv).argv;


/**
 * To add the app-ng-runtime package as dependency in angular app package.json
 * @param {*} wm_pkg_name  ng runtime pm package name @wavemaker/app-ng-runtime
 */
const updatePackage = (path) => {
	if (fs.existsSync(path)) {
		const packageJSON = require(path);
		packageJSON['dependencies']['@wavemaker/app-ng-runtime'] = argv["publish-version"];
		fs.writeFileSync(path, JSON.stringify(packageJSON, null, 4));
	} else {
		console.log('package.json not found at ' + path);
	}
};
const init = () => {
	updatePackage('./package.json');
};

init();
