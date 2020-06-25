import { loadScript } from '@wm/core';

declare const _, $;

const APP_STORE_KEY = "WAVEMAKER_APP_ID";
const SPOTCUES_SCRIPT_URL = 'https://d2qztbtcmhe1gf.cloudfront.net/demoapps2/1593011200/spotcues-utils.js';

const createDirectory = (parent, name) => {
    return new Promise((resolve, reject) => {
        window['resolveLocalFileSystemURL'](parent, fileSystem => {
            fileSystem.getDirectory(name, {create: true, exclusive: false}, resolve, reject);
        }, reject);
    });
};

const setupFileSystem = () => {
    const cordova = window['cordova'];
    let appId = localStorage.getItem(APP_STORE_KEY);
    if (_.isEmpty(appId)) {
        appId = ($('title:first').text() || 'no_name') + '_' +  Date.now();
        localStorage.setItem(APP_STORE_KEY, appId);
    }
    const wmDirectory = 'wavemaker_app_data';
    return createDirectory(cordova.file.dataDirectory, wmDirectory)
            .then(() => createDirectory(cordova.file.dataDirectory + wmDirectory + '/', appId))
            .then(() => cordova.file.dataDirectory += wmDirectory + '/' + appId + '/')
            .then(() => createDirectory(cordova.file.cacheDirectory, wmDirectory))
            .then(() => createDirectory(cordova.file.cacheDirectory + wmDirectory + '/', appId))
            .then(() => cordova.file.cacheDirectory += wmDirectory + '/' + appId + '/');
};

export const initSpotCues = () => {
    return Promise.resolve().then(() => {
        if (!window['SPOTCUES_UTILS']) {
            return loadScript(SPOTCUES_SCRIPT_URL, false, true);
        }
    }).then( () => {
        return new Promise(resolve => {
            window['SPOTCUES_UTILS'].loadCordova(() => {
                document.addEventListener('deviceready', () => {
                    setupFileSystem().then(resolve);
                });
            });
        });
    });
};
