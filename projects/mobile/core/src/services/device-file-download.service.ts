import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpEvent,
    HttpEventType,
    HttpHeaders,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';

import { File } from '@ionic-native/file';
import { Observer } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { FileExtensionFromMimePipe } from '@wm/components/base';

import { DeviceFileService } from './device-file.service';

const MAX_CONCURRENT_DOWNLOADS = 2;
declare const _;

@Injectable({ providedIn: 'root' })
export class DeviceFileDownloadService {
    static readonly SERVICE_NAME = 'DeviceFileDownloadService';
    private _downloadQueue = [];
    private _concurrentDownloads = 0;

    constructor(
        private cordovaFile: File,
        private http: HttpClient,
        private deviceFileService: DeviceFileService,
        public fileExtensionFromMimePipe: FileExtensionFromMimePipe) {

    }

    public download(url: string, isPersistent: boolean, destFolder?: string, destFile?: string, progressObserver?: Observer<any>, headers?: any): Promise<string> {
        return this.addToDownloadQueue(url, isPersistent, destFolder, destFile, progressObserver, headers);
    }

    // Adds to download request queue
    private addToDownloadQueue(url: string, isPersistent: boolean, destFolder?: string, destFile?: string, progressObserver?: Observer<any>, headers?: any): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this._downloadQueue.push({
                url: url,
                headers: headers,
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
        let filePath, blob;
        this._concurrentDownloads++;

        return this.sendHttpRequest(req.url, req.progressObserver, req.headers).then((e) => {
            blob = (e as HttpResponse<Blob>).body;
            return this.getFileName(e, req, blob.type);
        }).then((fileName) => {
            if (!req.destFolder) {
                req.destFolder = this.deviceFileService.findFolderPath(req.isPersistent, fileName);
            }
            filePath = req.destFolder + fileName;
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

    /**
     * Returns the filename
     * 1. if filename exists just return
     * 2. retrieve the filename from response headers i.e. content-disposition
     * 3. pick the filename from the end of the url
     * If filename doesnt contain the extension then extract using mimeType.
     * Generates newFileName if filename already exists.
     * @param response, download file response
     * @param req, download request params
     * @param mimeType mime type of file
     * @returns {Promise<string>}
     */
    private getFileName(response, req, mimeType) {
        const disposition = response.headers.get('Content-Disposition');
        let filename = req.destFile;
        if (!filename && disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches !== null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }
        if (!filename) {
            filename = req.url.split('?')[0];
            filename = filename.split('/').pop();
        }

        let fileExtension;
        if (mimeType) {
            fileExtension = this.fileExtensionFromMimePipe.transform(mimeType);
        }
        let hasFileExtension;
        // one or more file extensions can have same mimeType then loop over the file extensions.
        if (_.isArray(fileExtension)) {
            hasFileExtension = _.find(fileExtension, extension => _.endsWith(filename, extension));
        }
        if (!hasFileExtension && !_.endsWith(filename, fileExtension)) {
            filename = filename + fileExtension;
        }

        const folder = req.destFolder || this.deviceFileService.findFolderPath(req.isPersistent, filename);
        return this.deviceFileService.newFileName(folder, filename);
    }

    private sendHttpRequest(url: string, progressObserver: Observer<HttpEvent<any>>, headers?: any): Promise<HttpResponse<any>> {
        let reqHeaders = new HttpHeaders();

        // headers
        if (headers) {
            Object.entries(headers).forEach(([k, v]) => reqHeaders = reqHeaders.append(k, v as string));
        }
        const req = new HttpRequest('GET', url, {
            headers: reqHeaders,
            responseType: 'blob',
            reportProgress: progressObserver != null
        });
        return this.http.request(req)
            .pipe(
                map(e => {
                    if (progressObserver && progressObserver.next && e.type === HttpEventType.DownloadProgress) {
                        progressObserver.next(e);
                    }
                    return e;
                }),
                filter(e => e.type === HttpEventType.Response),
                map( e => {
                    if (progressObserver && progressObserver.complete) {
                        progressObserver.complete();
                    }
                    return (e as HttpResponse<any>);
                })
            )
            .toPromise();
    }
}
