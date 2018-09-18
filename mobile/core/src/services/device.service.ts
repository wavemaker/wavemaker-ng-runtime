import {Injectable} from '@angular/core';

import { File } from '@ionic-native/file';

import {hasCordova, noop} from '@wm/core';

import { IDeviceStartUpService } from './device-start-up-service';

declare const cordova, _;

const REGISTRY_FILE_NAME = 'registry.info';

@Injectable()
export class DeviceService {

    private _registry = {};
    private _isReady = false;
    private _whenReadyPromises = [];
    private _backBtnTapListeners = [];
    private _startUpServices: IDeviceStartUpService[] = [];

    public constructor(private file: File) {
        const maxWaitTime = 10;
        setTimeout(() => {
            if (!this._isReady) {
                console.warn(`Device is not ready even after ${maxWaitTime} seconds`);
                console.warn('Waiting For %O', this._startUpServices.map(i => i.serviceName));
            }
        }, maxWaitTime * 1000);
        document.addEventListener('backbutton', ($event) => {
            _.forEach(this._backBtnTapListeners, fn => {
                return fn($event) !== false;
            });
        });
    }

    public addStartUpService(service: IDeviceStartUpService) {
        this._startUpServices.push(service);
    }

    public onBackButtonTap(fn: ($event) => boolean) {
        this._backBtnTapListeners.unshift(fn);
        return () => {
            const i = this._backBtnTapListeners.indexOf(fn);
            if (i >= 0) {
                this._backBtnTapListeners.splice(i, 1);
            }
        };
    }

    public start() {
        if (this._isReady || this._startUpServices.length === 0) {
            this._isReady = true;
            return Promise.resolve();
        } else {
            return new Promise((resolve) => {
                if (hasCordova()) {
                    document.addEventListener('deviceready', () => resolve(), false);
                } else {
                    resolve();
                }
            }).then(() => {
                return this.file.readAsText(cordova.file.dataDirectory, REGISTRY_FILE_NAME)
                    .then(content =>  this._registry = JSON.parse(content), noop);
            }).then(() => {
                return Promise.all(this._startUpServices.map(s => {
                    return s.start().catch((error) => {
                        console.error('%s failed to start due to: %O', s.serviceName, error);
                        return Promise.reject(error);
                    });
                }));
            }).then(() => {
                window['wmDeviceReady'] = true;
                document.dispatchEvent(new CustomEvent('wmDeviceReady'));
                this._startUpServices.length = 0;
                this._whenReadyPromises.forEach(fn => fn());
                this._isReady = true;
            });
        }
    }

    public whenReady(): Promise<void> {
        if (this._isReady) {
            return Promise.resolve();
        } else {
            return new Promise<void>((resolve) => {
                this._whenReadyPromises.push(resolve);
            });
        }
    }

    /**
     * @returns {Promise<number>} promise resolved with the app build time
     */
    public getAppBuildTime(): Promise<number> {
        return this.file.readAsText(cordova.file.applicationDirectory + 'www', 'config.json')
            .then(appConfig => (JSON.parse(appConfig).buildTime) as number);
    }

    /**
     * Stores an entry that survives app restarts and updates.
     *
     * @param {string} key
     * @param {Object} value
     * @returns {Promise<any>}
     */
    public storeEntry(key: string, value: Object): Promise<any> {
        this._registry[key] = value;
        return this.file.writeFile(cordova.file.dataDirectory,
            REGISTRY_FILE_NAME,
            JSON.stringify(this._registry),
            { replace: true });
    }

    /**
     * @param {string} key
     * @returns {any} entry corresponding to the key
     */
    public getEntry(key: string): any {
        return this._registry[key];
    }
}