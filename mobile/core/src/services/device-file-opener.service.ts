import { Injectable } from '@angular/core';

import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { now } from 'moment';

import { isAndroid, isIos, noop } from '@wm/core';

import { DeviceFileCacheService } from './device-file-cache.service';
import { DeviceFileDownloadService } from './device-file-download.service';
import { DeviceFileService } from './device-file.service';
import { IDeviceStartUpService } from './device-start-up-service';


declare const cordova;

@Injectable()
export class DeviceFileOpenerService implements IDeviceStartUpService {

    public serviceName = DeviceFileOpenerService.name;

    private _downloadsFolder;

    constructor(private cordovaFile: File,
                private cordovaFileOpener: FileOpener,
                private fileService: DeviceFileService,
                private cacheService: DeviceFileCacheService,
                private downloadService: DeviceFileDownloadService) {

    }

    public openRemoteFile(url: string, mimeType: string, extension: string): Promise<void> {
        return this.getLocalPath(url, extension)
            .then(filePath => {
                return this.cordovaFileOpener.open(filePath, mimeType);
            });
    }

    public start(): Promise<void> {
        let downloadsParent;
        if (isAndroid()) {
            downloadsParent = cordova.file.externalCacheDirectory;
        } else if (isIos()) {
            downloadsParent = cordova.file.documentsDirectory + 'NoCloud/';
        } else {
            downloadsParent = cordova.file.dataDirectory;
        }
        return this.cordovaFile.createDir(downloadsParent, 'downloads', false)
            .catch(noop)
            .then(() => {
                this._downloadsFolder = downloadsParent + 'downloads/';
            });
    }

    private generateFileName(url: string, extension: string): string {
        let fileName = url.split('?')[0];
        fileName = fileName.split('/').pop();
        fileName = this.fileService.appendToFileName(fileName, '' + now());
        if (extension) {
            return fileName.split('.')[0] + '.' + extension;
        }
        return fileName;
    }

    private getLocalPath(url: string, extension: string): Promise<string> {
        return new Promise( (resolve, reject) => {
            return this.cacheService.getLocalPath(url, false, false)
                    .then( filePath => {
                        let fileName, i, fromDir, fromFile;
                        // Is it part of downloaded folder.
                        if (filePath.startsWith(this._downloadsFolder)) {
                            resolve(filePath);
                        } else {
                            fileName = this.generateFileName(url, extension);
                            i = filePath.lastIndexOf('/');
                            fromDir = filePath.substring(0, i);
                            fromFile = filePath.substring(i + 1);
                            this.cordovaFile.copyFile(fromDir, fromFile, this._downloadsFolder, fileName)
                                .then(() => {
                                    const newFilePath = this._downloadsFolder + fileName;
                                    this.cacheService.addEntry(url, newFilePath);
                                    resolve(newFilePath);
                                });
                        }
                    }).catch(() => {
                        const fileName = this.generateFileName(url, extension);
                        this.downloadService.download(url, false, this._downloadsFolder, fileName)
                            .then(filePath => {
                                this.cacheService.addEntry(url, filePath);
                                resolve(filePath);
                            }, reject);
                    });
        });
    }
}