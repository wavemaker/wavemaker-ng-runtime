import { Injectable } from '@angular/core';

import { convertToBlob, AbstractSpinnerService } from '@wm/core';
import { FileBrowserComponent } from './file-browser.component';

declare const _;
declare const window, cordova;

export interface FileContent {
    name: string;
    path: string;
    blob: any;
}

@Injectable({ providedIn: 'root' })
export class FileSelectorService {
    static readonly SERVICE_NAME = 'FileSelectorService';

    private fileBrowserComponent: FileBrowserComponent;

    public constructor(private spinnerService: AbstractSpinnerService) {}

    public selectAudio(multiple = false): Promise<any> {
        var spinnerId = this.spinnerService.show("");
        return new Promise<string[]>((resolve, reject) => {
            cordova.wavemaker.filePicker.selectAudio(multiple, resolve, reject);
        }).then(files => this.getFiles(files))
        .then((paths) => {
            this.spinnerService.hide(spinnerId);
            return paths;
        });
    }

    public setFileBrowser(f: FileBrowserComponent) {
        this.fileBrowserComponent = f;
    }

    public selectFiles(multiple = false, fileTypeToSelect?: string): Promise<FileContent[]> {
        var spinnerId = this.spinnerService.show("");
        return new Promise<string[]>((resolve, reject) => {
            cordova.wavemaker.filePicker.selectFiles(multiple, resolve, reject);
        }).then(files => this.getFiles(files))
        .then((paths) => {
            this.spinnerService.hide(spinnerId);
            return paths;
        });
    }

    public selectImages(multiple = false): Promise<FileContent[]> {
        var spinnerId = this.spinnerService.show("");
        return new Promise<string[]>((resolve, reject) => {
            cordova.wavemaker.filePicker.selectImage(multiple, resolve, reject);
        }).then(files => this.getFiles(files))
        .then((paths) => {
            this.spinnerService.hide(spinnerId);
            return paths;
        });
    }

    public selectVideos(multiple = false): Promise<FileContent[]> {
        var spinnerId = this.spinnerService.show("");
        return new Promise<string[]>((resolve, reject) => {
            cordova.wavemaker.filePicker.selectVideo(multiple, resolve, reject);
        }).then(files => this.getFiles(files))
        .then((paths) => {
            this.spinnerService.hide(spinnerId);
            return paths;
        });

    }

    /**
     * Converts the file to blob using filepath
     * @param filePaths, array of file paths
     * @returns fileObj having name, path, content
     */
    private getFiles(filePaths: string[]): Promise<FileContent[]> {
        return Promise.all(_.map(filePaths, filePath => {
                if (filePath.indexOf('://') < 0) {
                    filePath = 'file://' + filePath;
                }
                return convertToBlob(filePath)
            })).then(filesList => {
                return _.map(filesList, fileObj => {
                    const path = fileObj.filepath;
                    return {
                        name: path.split('/').pop(),
                        path: path,
                        content: fileObj.blob,
                        size: fileObj.blob.size
                    };
                });
            });
    }
}
