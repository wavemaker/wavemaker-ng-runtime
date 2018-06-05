import { Injectable } from '@angular/core';

import { File } from '@ionic-native/file';

import { DeviceFileService } from './device-file.service';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observer } from 'rxjs/Observer';

const MAX_CONCURRENT_DOWNLOADS = 2;

@Injectable()
export class DeviceFileDownloadService {

    private _downloadQueue = [];
    private _concurrentDownloads = 0;

    constructor(
        private cordovaFile: File,
        private http: HttpClient,
        private deviceFileService: DeviceFileService) {

    }

    public download(url: string, isPersistent: boolean, destFolder?: string, destFile?: string, progressObserver?: Observer<any>): Promise<string> {
        return this.addToDownloadQueue(url, isPersistent, destFolder, destFile, progressObserver);
    }

    // Adds to download request queue
    private addToDownloadQueue(url: string, isPersistent: boolean, destFolder?: string, destFile?: string, progressObserver?: Observer<any>): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this._downloadQueue.push({
                url: url,
                isPersistent: isPersistent,
                destFolder: destFolder,
                destFile: destFile,
                resolve: resolve,
                reject: reject,
                progressObserver: progressObserver
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
                return this.sendHttpRequest(req.url, req.progressObserver);
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

    private sendHttpRequest(url: string, progressObserver: Observer<HttpEvent<any>>): Promise<Blob> {
        const req = new HttpRequest('GET', url, {
            responseType: 'blob',
            reportProgress: progressObserver != null
        });
        return this.http.request(req)
            .map(e => {
                if (progressObserver && progressObserver.next && e.type === HttpEventType.DownloadProgress) {
                    progressObserver.next(e);
                }
                return e;
            }).filter(e => e.type === HttpEventType.Response)
            .map( e => {
                if (progressObserver && progressObserver.complete) {
                    progressObserver.complete();
                }
                return (e as HttpResponse<Blob>).body;
            })
            .toPromise();
    }
}