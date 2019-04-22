import { HttpClient } from '@angular/common/http';
import { Component, ElementRef } from '@angular/core';

import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';

import { addClass, hasCordova, noop, removeClass, setCSS } from '@wm/core';
import { DeviceFileDownloadService, DeviceService } from '@wm/mobile/core';

declare const cordova;

const DEFAULT_CLS = 'app-update-dialog modal fade in hidden';

const AUTO_UPDATE_FILENAME = 'app-auto-update.apk';

@Component({
    selector: '[wmAppUpdate]',
    templateUrl: './app-update.component.html'
})
export class AppUpdateComponent {

    public downloadProgress = 0;
    public downloading = false;
    public message = 'There is an update available. Would you like to update the app?';

    private _buildMeta: any;

    constructor(
        private deviceService: DeviceService,
        private fileDownloadService: DeviceFileDownloadService,
        private elRef: ElementRef,
        private file: File,
        private fileOpener: FileOpener,
        private http: HttpClient
    ) {

        addClass(this.elRef.nativeElement, DEFAULT_CLS);
        setCSS(this.elRef.nativeElement, 'display', 'block');
        if (hasCordova()) {
            this.getBuildMeta().then(buildMeta => {
                if (buildMeta && buildMeta.buildMode === 'DEVELOPMENT_MODE') {
                    this.file.removeFile(cordova.file.externalApplicationStorageDirectory, AUTO_UPDATE_FILENAME).catch(noop);
                    this.checkForUpdate()
                        .then(this.getUserConfirmation.bind(this), noop);
                }
            });
        }
    }

    public cancel() {
        addClass(this.elRef.nativeElement, 'hidden');
    }

    public installLatestVersion() {
        const apkFile =  cordova.file.externalApplicationStorageDirectory + AUTO_UPDATE_FILENAME,
            downloadLink = `${this._buildMeta.host}/appBuild/rest/mobileBuilds/android/download?token=${this._buildMeta.token}&buildNumber=${this._buildMeta.latestBuildNumber}&fileName=${AUTO_UPDATE_FILENAME}&releaseVersion=${this._buildMeta.platformVersion}`,
            progressObserver = { next: e => { this.downloadProgress = (e.loaded / e.total) * 100; }, error: null, complete: null};
        this.fileDownloadService.download(
            downloadLink,
            false,
            cordova.file.externalApplicationStorageDirectory,
            AUTO_UPDATE_FILENAME,
            progressObserver).then(() => {
                this.fileOpener.open(apkFile, 'application/vnd.android.package-archive');
            }, function () {
                this.message = 'Failed to download latest version.';
            });
        this.message = `Downloading the latest version [${this._buildMeta.latestVersion}].`;
        this.downloading = true;
    }

    private checkForUpdate() {
        return new Promise((resolve, reject) => {
            this.http.get(`${this._buildMeta.host}/appBuild/rest/mobileBuilds/latest_build?token=${this._buildMeta.token}`)
                .toPromise()
                .then((response: any) => {
                    const latestBuildNumber = response.success.body.buildNumber,
                        latestVersion =  response.success.body.version;
                    if (this._buildMeta.buildNumber < latestBuildNumber) {
                        this._buildMeta.latestBuildNumber = latestBuildNumber;
                        this._buildMeta.latestVersion = latestVersion;
                        resolve(latestBuildNumber);
                    } else {
                        reject();
                    }
                }, reject);
        });
    }

    private getBuildMeta() {
        if (!this._buildMeta) {
            return this.file.readAsText(cordova.file.applicationDirectory + 'www/', 'build_meta.json')
                .then(data => {
                    this._buildMeta = JSON.parse(data);
                    return this._buildMeta;
                }, noop);
        }
        return Promise.resolve(this._buildMeta);
    }

    private getUserConfirmation() {
        this.downloadProgress = 0;
        this.downloading = false;
        this.message = 'There is an update available. Would you like to update the app?';
        removeClass(this.elRef.nativeElement, 'hidden');
    }
}
