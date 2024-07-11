import { Injectable } from '@angular/core';

import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import {File} from '@awesome-cordova-plugins/file/ngx';

import { isAndroid, noop } from '@wm/core';

import { IDeviceStartUpService } from './device-start-up-service';
import {now} from "lodash-es";

declare const cordova;
declare const resolveLocalFileSystemURL;
declare const FileReader;

export enum FileType {
    AUDIO = 'AUDIO',
    DOCUMENT = 'DOCUMENT',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO'
}

const IMAGE_EXTENSIONS = ['gif', 'jpg', 'png', 'svg', 'webp', 'jpeg', 'jif', 'jfif', 'jfi'],
    VIDEO_EXTENSIONS = ['mp4', 'mpg', 'avi', 'wma', 'mp2', '3gp', '3g2', 'm4p', 'm4v', 'mpg', 'fiv'],
    AUDIO_EXTENSIONS = ['mp3', 'm4p', 'aiff', 'aa', 'aax', 'wma'];

const APP_FOLDER_STRUCTURE = [{
    name : '{APP_NAME}',
    children : [{
        name : 'Media',
        children : [
            {
                name : '{APP_NAME} Images',
                fileType : FileType.IMAGE
            },
            {
                name : '{APP_NAME} Audio',
                fileType : FileType.AUDIO
            },
            {
                name : '{APP_NAME} Vedios',
                fileType : FileType.VIDEO
            },
            {
                name : '{APP_NAME} Documents',
                fileType : FileType.DOCUMENT
            }
        ]
    }]
}];

@Injectable({ providedIn: 'root' })
export class DeviceFileService implements IDeviceStartUpService {
    static readonly SERVICE_NAME = 'DeviceFileService';

    private _appName: string;
    private _fileTypeVsPathMap = {
        'temporary' : {},
        'persistent' : {}
    };
    private _uploadDir: string;

    constructor(private cordovaAppVersion: AppVersion, private cordovaFile: File) {

    }

    public addMediaToGallery(filePath: string): Promise<void> {
        if (isAndroid() && this.isPersistentType(filePath)) {
            return new Promise((resolve, reject) => {
                cordova.plugins.MediaScannerPlugin.scanFile(filePath, resolve, reject);
            });
        }
        return Promise.resolve();
    }

    public appendToFileName(fileName: string, attachment?: string): string {
        let splits;
        attachment = attachment || '_' + now();
        fileName = fileName || 'noname';
        splits = fileName.split('.');
        if (splits.length > 1) {
            splits[splits.length - 2] = splits[splits.length - 2] + attachment;
            return splits.join('.');
        }
        return fileName + attachment;
    }

    public clearTemporaryStorage(): Promise<any> {
        return this.cordovaFile.removeRecursively(this.getTemporaryRootPath() + this._appName + '/', 'Media');
    }

    public copy(persistent: boolean, sourceFilePath: string) {
        const sourceFilename = sourceFilePath.split('/').pop(),
            destFolder = this.findFolderPath(persistent, sourceFilename),
            sourceFolder = sourceFilePath.substring(0, sourceFilePath.lastIndexOf('/'));
        return this.newFileName(destFolder, sourceFilename)
            .then( destFilename => this.cordovaFile.copyFile(sourceFolder, sourceFilename, destFolder, destFilename)
                .then(() => destFolder + destFilename));
    }

    public findFolderPath(persistent: boolean, fileName: string) {
        const typeMap = persistent ? this._fileTypeVsPathMap.persistent : this._fileTypeVsPathMap.temporary,
            fileType = this.findFileType(fileName);
        return typeMap[fileType] || typeMap[FileType.DOCUMENT];
    }

    public getPersistentRootPath(): string {
        return cordova.file.dataDirectory;
    }

    public getTemporaryRootPath(): string {
        return cordova.file.cacheDirectory;
    }

    public getUploadDirectory(): string {
        return this._uploadDir;
    }

    public isPersistentType(filePath: string): boolean {
        return filePath.startsWith(this.getPersistentRootPath());
    }

    public isValidPath(filePath: string): Promise<string> {
        let folder, fileName;
        if (!filePath) {
            return Promise.reject('File path is required');
        }
        folder = filePath.substring(0, filePath.lastIndexOf('/') + 1);
        fileName = filePath.split('/').pop();
        return this.cordovaFile.checkFile(folder, fileName)
            .then(() => filePath);
    }

    public listFiles(folder: string, search: string | RegExp): Promise<Map<string, any>[]> {
        return new Promise((resolve, reject) => {
            resolveLocalFileSystemURL(folder, directory => {
                if (!directory.files) {
                    directory.createReader().readEntries(entries => {
                        if (search) {
                            entries = entries.filter(e => e.name.match(search));
                        }
                        entries = entries.map( e => {
                            return {
                                name : e.name,
                                isDirectory : e.isDirectory,
                                path : e.nativeURL
                            };
                        });
                        resolve(entries);
                    }, reject);
                } else {
                    resolve([]);
                }
            }, reject);
        });
    }

    public newFileName(folder: string, fileName: string): Promise<string> {
        return this.cordovaFile.checkFile(folder, fileName)
            .then(() => {
                const extIndex = fileName.lastIndexOf('.');
                if (extIndex > 0) {
                    fileName = fileName.substring(0, extIndex) + '_' + now() + '.' + fileName.substring(extIndex + 1);
                } else {
                    fileName = fileName + '_' + now();
                }
                return this.newFileName(folder, fileName);
            }, () => fileName);
    }

    public removeFile(filePath: string): Promise<any> {
        const i = filePath.lastIndexOf('/'),
            dir = filePath.substring(0, i),
            file = filePath.substring(i + 1);
        return this.cordovaFile.removeFile(dir, file);
    }

    /**
     * removes the directory at the specified location.
     *
     * @param dirPath absolute path of directory
     */
    public removeDir(dirPath: string): Promise<any> {
        const i = dirPath.lastIndexOf('/'),
            parentdir = dirPath.substring(0, i + 1),
            dir = dirPath.substring(i + 1),
            movedDir = dir + now();
        return this.cordovaFile.checkDir(parentdir, dir)
            .then(() => {
                /**
                 * If folder is remove directly without moving, then INVALID_MODIFICATION_ERR is thrown in android
                 * when a copy operation is done with the same directory name. To avoid this, directory will be moved
                 * first and removed.
                 */
                return this.cordovaFile.moveDir(parentdir, dir, parentdir, movedDir)
                    .then(() => this.cordovaFile.removeDir(parentdir, movedDir));
            }).catch(noop);
    }

    public start(): Promise<any> {
        /**
         * Default READ_CHUNK_SIZE is 256 Kb. But with that setting readJson method is failing. This is an issue
         * with cordova file plugin. So, increasing it to 512 Kb to read large database schema files (>256 Kb).
         */
        FileReader.READ_CHUNK_SIZE = 512 * 1024;
        return Promise.resolve().then(() => {
                return this.cordovaAppVersion.getAppName();
            }).then(appName => {
                const promises = [];
                this._appName = appName;
                promises.push(this.createFolderIfNotExists(this.getTemporaryRootPath(),
                    APP_FOLDER_STRUCTURE,
                    this._fileTypeVsPathMap.temporary));
                promises.push(this.createFolderIfNotExists(this.getPersistentRootPath(),
                    APP_FOLDER_STRUCTURE,
                    this._fileTypeVsPathMap.persistent));
                promises.push(this.setupUploadDirectory());
                return Promise.all(promises);
            }).then(() => {
                if (isAndroid()) {
                    // this is necessary to prevent multiple file permission popup.
                    return this.cordovaFile.readAsText(cordova.file.externalRootDirectory, 'random-file-for-permission').catch(noop);
                }
            });
    }

    public getServiceName() {
        return DeviceFileService.SERVICE_NAME;
    }

    private createFolderIfNotExists(parent: string, folders, fileTypeLocationMap) {
        const childPromises = [];
        if (folders) {
            folders.forEach(folder => {
                let folderPath;
                folder.name = folder.name.replace('{APP_NAME}', this._appName);
                folderPath = parent + folder.name + '/';
                if (folder.fileType && !fileTypeLocationMap[folder.fileType]) {
                    fileTypeLocationMap[folder.fileType] = folderPath;
                }
                const p = this.cordovaFile.createDir(parent, folder.name, false)
                    .then(() => this.createFolderIfNotExists(folderPath, folder.children, fileTypeLocationMap),
                        () => this.createFolderIfNotExists(folderPath, folder.children, fileTypeLocationMap));
                childPromises.push(p);
            });
        }
        if (childPromises.length > 0) {
            return Promise.all(childPromises);
        }
    }

    private findFileType(fileName) {
        let extension;
        if (fileName.indexOf('.') > 0) {
            extension = fileName.split('.').pop().toLowerCase();
            if (IMAGE_EXTENSIONS.some(a => a === extension)) {
                return FileType.IMAGE;
            }
            if (VIDEO_EXTENSIONS.some(a => a === extension)) {
                return FileType.VIDEO;
            }
            if (AUDIO_EXTENSIONS.some(a => a === extension)) {
                return FileType.AUDIO;
            }
        }
        return FileType.DOCUMENT;
    }

    private setupUploadDirectory() {
        const uploadsDirName = 'uploads',
            appDir = cordova.file.dataDirectory;
        return this.cordovaFile.checkDir(appDir, uploadsDirName)
            .then(() => this._uploadDir = appDir + uploadsDirName,
                () => this.cordovaFile.createDir(appDir, uploadsDirName, true)
                    .then(() => this._uploadDir = appDir + uploadsDirName));
    }
}
