import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

import { $appDigest, isIos } from '@wm/core';
import { DeviceService } from '@wm/mobile/core';

declare const _;
declare const cordova;
declare const resolveLocalFileSystemURL;

export interface File {
    name: string;
    size: number;
    isSelected: boolean;
    file: (success: (navtiveFileObject: any) => void, failure: (message: any) => any) => void;
}

export interface Folder {
    name: string;
    files: File[];
    folders: Folder[];
    parent: Folder;
}

@Component({
    selector: '[wmMobileFileBrowser]',
    templateUrl: './file-browser.component.html'
})
export class FileBrowserComponent implements OnDestroy {

    public currentFolder: Folder;
    @Input() public fileTypeToSelect: string;
    @Input() public multiple: boolean;
    public selectedFiles: File[] = [];
    @Output('submit') submitEmitter = new EventEmitter();
    public isVisible: boolean;

    private backButtonListenerDeregister: any;

    constructor(private deviceService: DeviceService) {}


    public getFileExtension(fileName: string): string {
        const extIndex = fileName ? fileName.lastIndexOf('.') : -1;
        if (extIndex > 0) {
            return fileName.substring(extIndex + 1);
        }
        return '';
    }

    public ngOnDestroy() {
        if (this.backButtonListenerDeregister) {
            this.backButtonListenerDeregister();
        }
    }

    public onFileClick(file): void {
        if (file.isFile) {
            if (file.isSelected) {
                this.deselectFile(file);
            } else {
                this.selectFile(file);
            }
        } else {
            this.goToFolder(file);
        }
    }

    public set show(flag: boolean) {
        let rootDir = cordova.file.externalRootDirectory;
        this.isVisible = flag;
        if (flag) {
            if (!this.currentFolder) {
                if (isIos()) {
                    rootDir = cordova.file.documentsDirectory;
                }
                resolveLocalFileSystemURL(rootDir, root => this.goToFolder(root));
            }
            this.backButtonListenerDeregister = this.deviceService.onBackButtonTap(() => {
                if (this.isVisible) {
                    if (this.currentFolder.parent) {
                        this.onFileClick(this.currentFolder.parent);
                    } else {
                        this.isVisible = false;
                    }
                    $appDigest();
                    return false;
                }
            });
        } else if (this.backButtonListenerDeregister) {
            this.backButtonListenerDeregister();
        }
    }

    public submit() {
        const files = [];
        this.loadFileSize(this.selectedFiles).then(() => {
            _.forEach(this.selectedFiles, function (f) {
                f.isSelected = false;
                files.push({ path: f.nativeURL,
                    name: f.name,
                    size : f.size});
            });
            this.selectedFiles = [];
            this.isVisible = false;
            this.submitEmitter.next({files: files});
        });
    }

    private deselectFile(file: File): void {
        _.remove(this.selectedFiles, file);
        file.isSelected = false;
    }

    private goToFolder(folder: Folder): void {
        if (!folder.files) {
            this.loadFolder(folder, this.fileTypeToSelect)
                .then(files => {
                    folder.files = files;
                    folder.parent = this.currentFolder;
                    this.currentFolder = folder;
                });
        } else {
            this.currentFolder = folder;
        }
    }

    private loadFileSize(files: File[]): Promise<void[]> {
        return Promise.all(files.map(f => {
            return new Promise<void>((resolve, reject) => {
                f.file(o => {
                    f.size = o.size;
                    resolve();
                }, reject);
            });
        }));
    }

    private loadFolder(folder: any, fileTypeToSelect: string): Promise<File[]> {
        return new Promise((resolve, reject) => {
            let fileTypeToShow;
            folder.createReader().readEntries((entries:  File[]) => {
                if (!_.isEmpty(fileTypeToSelect)) {
                    fileTypeToShow = _.split(fileTypeToSelect, ',');
                    entries = _.filter(entries, e => {
                        return !e.isFile || _.findIndex(fileTypeToShow, ext => _.endsWith(e.name, '.' + ext)) >= 0;
                    });
                }
                resolve(_.sortBy(entries, e => (e.isFile ? '1_' : '0_') + e.name.toLowerCase()));
            }, reject);
        });
    }


    private refreshFolder(): Promise<any> {
        return this.loadFolder(this.currentFolder, this.fileTypeToSelect)
            .then(files => this.currentFolder.files = files);
    }

    private selectFile(file): void {
        if (!this.multiple && this.selectedFiles.length > 0) {
            this.selectedFiles[0].isSelected = false;
            this.selectedFiles = [];
        }
        this.selectedFiles.push(file);
        file.isSelected = true;
    }

}