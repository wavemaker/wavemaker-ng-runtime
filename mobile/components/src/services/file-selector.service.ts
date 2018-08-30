import { Injectable } from '@angular/core';


import { Camera } from '@ionic-native/camera';

import { convertToBlob, isAndroid, isIphone } from '@wm/core';
import { FileBrowserComponent } from '../widgets/file-browser/file-browser.component';

declare const _;
declare const window;

export interface FileContent {
    name: string;
    path: string;
    blob: any;
}

@Injectable()
export class FileSelectorService {

    private fileBrowserComponent: FileBrowserComponent;

    public constructor(private camera: Camera) {}

    public selectAudio(multiple = false): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            // if multiple is true allows user to select multiple songs
            // if icloud is true will show iCloud songs
            (window['plugins']['mediapicker']).getAudio(resolve, reject, multiple, isIphone());
        }).then(files =>  {
            const filePaths = _.map(_.isArray(files) ? files : [files], 'exportedurl');
            return this.getFiles(filePaths);
        });
    }

    public setFileBrowser(f: FileBrowserComponent) {
        this.fileBrowserComponent = f;
    }

    public selectFiles(multiple = false, fileTypeToSelect?: string): Promise<FileContent[]> {
        if (!this.fileBrowserComponent) {
            return Promise.reject('File Browser component is not present.');
        }
        this.fileBrowserComponent.multiple = multiple;
        this.fileBrowserComponent.fileTypeToSelect = fileTypeToSelect;
        this.fileBrowserComponent.show = true;
        return new Promise<any[]>((resolve, reject) => {
            const subscription = this.fileBrowserComponent.submitEmitter.subscribe(result => {
                return this.getFiles(_.map(result.files, 'path'))
                    .then(files => {
                        subscription.unsubscribe();
                        this.fileBrowserComponent.show = false;
                        resolve(files);
                    }, () => {
                        subscription.unsubscribe();
                        this.fileBrowserComponent.show = false;
                        reject();
                    });
            });
        });
    }

    public selectImages(multiple = false): Promise<FileContent[]> {
        const maxImg = multiple ? 10 : 1;
        return new Promise<any>((resolve, reject) => {
            window.imagePicker.getPictures(resolve, reject,
                {
                    mediaType : 0,  // allows picture selection
                    maxImages: maxImg
                }
            );
        }).then(files => this.getFiles(files));
    }

    public selectVideos(multiple = false): Promise<FileContent[]> {
        const cameraOptions = {
            destinationType   : 1,  // file_uri
            sourceType        : 0,  // photolibrary
            mediaType         : 1  // allows video selection
        };

        return this.camera.getPicture(cameraOptions)
            .then(filepath => {
            if (filepath.indexOf('://') < 0) {
                filepath = 'file://' + filepath;
            }
            return this.getFiles([filepath]);
        });

    }

    /**
     * Converts the file to blob using filepath
     * @param filePaths, array of file paths
     * @returns fileObj having name, path, content
     */
    private getFiles(filePaths: string[]): Promise<FileContent[]> {
        return Promise.all(_.map(filePaths, filePath => convertToBlob(filePath)))
            .then(filesList => {
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