const fs = require('fs');
const path = require('path');

const wmPropertiesPath = path.join(__dirname, '../src/app/wmProperties.js');
const angularJsonPath = path.join(__dirname, '../angular.json');

let wmProperties;
try {
    wmProperties = require(wmPropertiesPath).WMAppProperties;
} catch (error) {
    console.error('Error reading wmProperties.js:', error);
    process.exit(1);
}

let angularJson;
try {
    angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf-8'));
} catch (error) {
    console.error('Error reading angular.json:', error);
    process.exit(1);
}

// Ensure angular.json has projects defined
if (!angularJson.projects || Object.keys(angularJson.projects).length === 0) {
    console.error('No projects found in angular.json');
    process.exit(1);
}

// Get the first project key from angular.json (assumes single-project setup)
const projectKey = Object.keys(angularJson.projects)[0];

// Retrieve existing assets array from angular.json
const existingAssets = angularJson.projects[projectKey].architect.build.options.assets || [];

const globPatternAngular = [];
const globPatternMoment = [];
const globPatternFullCalendar = [];

// Extract supported language configurations from wmProperties
for (const languageConfig of Object.values(wmProperties.supportedLanguages)) {
    if (languageConfig.angular) globPatternAngular.push(`${languageConfig.angular}.js`);
    if (languageConfig.fullCalendar) globPatternFullCalendar.push(`${languageConfig.fullCalendar}.js`);
    if (languageConfig.moment) globPatternMoment.push(`${languageConfig.moment}.js`);
}

/**
 * Adds or updates an asset in the existing assets array.
 * If an asset with the same input/output exists, it updates the glob pattern.
 * Otherwise, it adds a new asset entry.
 */
const addOrUpdateAsset = (assetObject) => {
    const existingAsset = existingAssets.find(asset => 
        asset.input === assetObject.input && asset.output === assetObject.output
    );

    existingAsset ? existingAsset.glob = assetObject.glob : existingAssets.push(assetObject);
};

// Define asset configurations for different libraries
const assetConfigs = [
    { patterns: globPatternAngular, path: 'angular/global' },
    { patterns: globPatternMoment, path: 'moment' },
    { patterns: globPatternFullCalendar, path: 'fullcalendar' }
];

// Loop through each asset configuration and add/update assets if there are patterns available
assetConfigs.forEach(({ patterns, path }) => {
    if (patterns.length > 0) {
        const glob = `{${patterns.join(',')}}`;

        // Define base paths where localized files are stored
        ['libraries/locales', 'node_modules/@wavemaker/app-ng-runtime/locales'].forEach(basePath => {
            addOrUpdateAsset({ glob, input: `${basePath}/${path}`, output: `/locales/${path}` });
        });
    }
});

// Update angular.json with the modified assets array
angularJson.projects[projectKey].architect.build.options.assets = existingAssets;

// Write the updated JSON back to angular.json
fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2), 'utf-8');

console.log('angular.json updated successfully.');
