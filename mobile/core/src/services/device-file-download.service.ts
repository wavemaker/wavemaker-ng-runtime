import { Injectable } from '@angular/core';

import { File } from '@ionic-native/file';

import { DeviceFileService } from './device-file.service';

const MAX_CONCURRENT_DOWNLOADS = 2;

@Injectable()
export class DeviceFileDownloadService {

    private _downloadQueue = [];
    private _concurrentDownloads = 0;

    constructor(private cordovaFile: File, private deviceFileService: DeviceFileService) {

    }

    public download(url: string, isPersistent: boolean, destFolder?: string, destFile?: string): Promise<string> {
        return this.addToDownloadQueue(url, isPersistent, destFolder, destFile);
    }

    // Adds to download request queue
    private addToDownloadQueue(url: string, isPersistent: boolean, destFolder?: string, destFile?: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this._downloadQueue.push({
                url: url,
                isPersistent: isPersistent,
                destFolder: destFolder,
                destFile: destFile,
                resolve: resolve,
                reject: reject
            });
            if (this._concurrentDownloads < MAX_CONCURRENT_DOWNLOADS) {
                this.downloadNext();
            }
        });
    }

    private downloadNext(): void {
        if (this._downloadQueue.length > 0) {
            const req = this._downloadQueue.shift();
            this.downloadFile(req).then(filePath => {
                req.resolve(filePath);
                this.downloadNext();
            }, () => {
                req.reject();
                this.downloadNext();
            });
        }
    }

    // Start processing a download request
    private downloadFile(req): Promise<string> {
        let filePath, fileName;
        this._concurrentDownloads++;
        if (!req.destFile) {
            req.destFile = req.url.split('?')[0];
            req.destFile = req.destFile.split('/').pop();
        }
        if (!req.destFolder) {
            req.destFolder = this.deviceFileService.findFolderPath(req.isPersistent, req.destFile);
        }
        return this.deviceFileService.newFileName(req.destFolder,  req.destFile)
            .then(newFileName => {
                fileName = newFileName;
                filePath = req.destFolder + newFileName;
                return this.sendHttpRequest(req.url);
            }).then((blob) => {
                return this.cordovaFile.writeFile(req.destFolder, fileName, blob);
            }).then(() => {
                this._concurrentDownloads--;
                return filePath;
            }, (response) => {
                this._concurrentDownloads--;
                this.cordovaFile.removeFile(req.destFolder, req.destFile);
                return Promise.reject(`Failed to downloaded  ${req.url} with error ${JSON.stringify(response)}`);
            });
    }

    private sendHttpRequest(url: string): Promise<Blob> {
        return new Promise<Blob>( (resolve, reject) => {
            // TODO: instead of xhr, use http-service
            const oReq = new XMLHttpRequest();
            oReq.open('GET', url, true);
            // Define how you want the XHR data to come back
            oReq.responseType = 'blob';
            oReq.onload = oEvent => {
                const blob = oReq.response; // Note: not oReq.responseText
                if (blob) {
                    resolve(blob);
                } else {
                    reject('Not able to download');
                }
            };
            oReq.onerror = reject;
            oReq.onabort = reject;
            oReq.send();
        });
    }
}