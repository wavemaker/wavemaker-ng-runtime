import { Injectable } from '@angular/core';

import { File } from '@ionic-native/file';


import { noop } from '@wm/core';

import { IDeviceStartUpService } from './device-start-up-service';
import { DeviceFileService } from './device-file.service';
import { DeviceFileDownloadService } from './device-file-download.service';

declare const cordova;

const CACHE_FILE_INDEX_NAME = 'appCache.json';

@Injectable()
export class DeviceFileCacheService implements IDeviceStartUpService {

    public serviceName = DeviceFileCacheService.name;

    private _cacheIndex = {};
    private _writing;
    private _saveCache;

    public constructor(private cordovaFile: File,
       private fileService: DeviceFileService,
       private downloadService: DeviceFileDownloadService) {

    }

    public addEntry(url, filepath): void {
        this._cacheIndex[url] = filepath;
        this.writeCacheIndexToFile();
    }

    public getLocalPath(url: string, downloadIfNotExists: boolean, isPersistent: boolean): Promise<string> {
        const filePath = this._cacheIndex[url];
        return this.fileService.isValidPath(filePath)
                .catch(() => {
                    delete this._cacheIndex[url];
                    if (downloadIfNotExists) {
                        return this.download(url, isPersistent);
                    } else {
                        Promise.reject('No cache entry for ' + url);
                    }
                });
    }

    public invalidateCache(): void {
        this._cacheIndex = {};
        this.writeCacheIndexToFile();
        this.fileService.clearTemporaryStorage();
    }

    public start(): Promise<void> {
        return this.cordovaFile.readAsText(cordova.file.dataDirectory, CACHE_FILE_INDEX_NAME)
            .then(content => {
                this._cacheIndex = JSON.parse(content);
            }, noop);
    }

    private download(url: string, isPersistent: boolean): Promise<string> {
        return this.downloadService.download(url, isPersistent)
            .then(filepath => {
                this._cacheIndex[url] = filepath;
                this.writeCacheIndexToFile();
                return filepath;
            });
    }

    private writeCacheIndexToFile(): void {
        if (!this._writing) {
            this._writing = true;
            this.cordovaFile.writeFile(cordova.file.dataDirectory, CACHE_FILE_INDEX_NAME, JSON.stringify(this._cacheIndex),
                {
                    replace: true
                })
                .catch(noop)
                .then(() => {
                    if (this._saveCache) {
                        setTimeout(() => {
                            this._writing = false;
                            this._saveCache = false;
                            this.writeCacheIndexToFile();
                        }, 5000);
                    } else {
                        this._writing = false;
                    }
                });
        } else {
            this._saveCache = true;
        }
    }
}