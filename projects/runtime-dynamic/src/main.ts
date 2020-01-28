import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

declare const _;
const DEBUG_MODE = 'debugMode';
const isSpotcues = /Spotcues/i.test(window['navigator'].userAgent);

if (sessionStorage.getItem(DEBUG_MODE) !== 'true') {
    enableProdMode();
}

console.time('app-bootstrap');

const createDirectory = (parent, name) => {
    return new Promise((resolve, reject) => {
        window['resolveLocalFileSystemURL'](parent, fileSystem => {
            fileSystem.getDirectory(name, {create: true, exclusive: false}, resolve, reject);
        }, reject);
    });
};

const generateHash = (message, algorithm = 'SHA-256') => {
    const msgUint8 = new window['TextEncoder']().encode(message);
    return crypto.subtle.digest(algorithm, msgUint8).then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    });
};

const setupFileSystem = () => {
    const cordova = window['cordova'];
    const url = location.href.substring(0, location.href.indexOf('?'));
    return generateHash(url).then((hash) => {
        return createDirectory(cordova.file.dataDirectory, hash)
            .then(() => cordova.file.dataDirectory += hash + '/')
            .then(() => createDirectory(cordova.file.cacheDirectory, hash))
            .then(() => cordova.file.cacheDirectory += hash + '/');
    });
};

document.addEventListener('DOMContentLoaded', () => {
    new Promise( resolve => {
        if (isSpotcues) {
            window['SPOTCUES_UTILS'].loadCordova(() => {
                document.addEventListener('deviceready', () => {
                    setupFileSystem().then(resolve);
                });
            });
        } else if (window['cordova']) {
            document.addEventListener('deviceready', resolve);
        } else {
            resolve();
        }
    }).then(() => platformBrowserDynamic().bootstrapModule(AppModule))
        .then(() => console.timeEnd('app-bootstrap'), err => console.log(err));
});

(window as any).debugMode = function(on) {
    if (_.isEmpty(on)) {
        on = true;
    }
    const value = on ? 'true' : 'false';
    if (sessionStorage.getItem(DEBUG_MODE) !== value) {
        sessionStorage.setItem(DEBUG_MODE, value);
        window.location.reload();
    }
};

export default () => {};
