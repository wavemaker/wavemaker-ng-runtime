import { File } from '@awesome-cordova-plugins/file/ngx';

import { noop } from '@wm/core';
import { DeviceFileService } from '@wm/mobile/core';

import { Change, ChangeLogService, FlushContext, Worker } from '../change-log.service';
import { CallBack, LocalDBManagementService } from '../local-db-management.service';
import {assignIn, isEmpty, isEqual, isObject, isString, mapValues, replace} from "lodash-es";

const STORE_KEY = 'offlineFileUpload';

export class FileHandler implements Worker {

    private fileStore;
    private logger = window.console;

    public preFlush(context: FlushContext) {
        this.fileStore = context.get(STORE_KEY);
    }

    /**
     * Replaces all local paths with the remote path using mappings created during 'uploadToServer'.
     */
    public preCall(change: Change) {
        if (change.service === 'DatabaseService') {
            change.params.data = mapValues(change.params.data, v => {
                const remoteUrl = this.fileStore[v];
                if (remoteUrl) {
                    this.logger.debug('swapped file path from %s -> %s', v, remoteUrl);
                    return remoteUrl;
                }
                return v;
            });
        }
    }

    public postCallSuccess(change: Change, response: any) {
        if (change.service === 'OfflineFileUploadService'
            && change.operation === 'uploadToServer') {
            const remoteFile = JSON.parse(response[0].text)[0];
            /*
             * A mapping will be created between local path and remote path.
             * This will be used to resolve local paths in entities.
             */
            this.fileStore[change.params.file]             = remoteFile.path;
            this.fileStore[change.params.file + '?inline'] = remoteFile.inlinePath;
        }
    }

}

export class UploadedFilesImportAndExportService implements CallBack {
    private uploadDir;

    constructor(
        private changeLogService: ChangeLogService,
        private deviceFileService: DeviceFileService,
        private localDBManagementService: LocalDBManagementService,
        private file: File
    ) {

    }

    public preExport(folderToExport: string, meta: any): Promise<any> {
        // copy offline uploads
        const uploadFullPath = this.deviceFileService.getUploadDirectory(),
            lastIndexOfSep = uploadFullPath.lastIndexOf('/'),
            uploadParentDir = uploadFullPath.substring(0, lastIndexOfSep + 1),
            uploadDirName = uploadFullPath.substring(lastIndexOfSep + 1);
        meta.uploadDir = uploadFullPath;
        return this.file.copyDir(uploadParentDir, uploadDirName, folderToExport, 'uploads');
    }

    public postImport(importedFolder: string, meta: any): Promise<any> {
        const uploadFullPath = this.deviceFileService.getUploadDirectory(),
            lastIndexOfSep = uploadFullPath.lastIndexOf('/'),
            uploadParentDir = uploadFullPath.substring(0, lastIndexOfSep + 1),
            uploadDirName = uploadFullPath.substring(lastIndexOfSep + 1);
        this.uploadDir = uploadFullPath;
        return this.file.checkDir(importedFolder, 'uploads')
            .then(() => {
                return this.deviceFileService.removeDir(uploadFullPath)
                    .then(() => this.file.copyDir(importedFolder, 'uploads', uploadParentDir, uploadDirName))
                    .then(() => this.updateChanges(meta));
            }, noop);
    }

    /**
     * returns back the changes that were logged.
     * @param page page number
     * @param size size of page
     * @returns {*}
     */
    private getChanges(page: number, size: number): Promise<Change[]> {
        return this.changeLogService.getStore().then(strore => {
            return (strore.filter([], 'id', {
                offset: (page - 1) * size,
                limit: size
            })) as Promise<Change[]>;
        });
    }

    /**
     * If this is a database change, then it will replace old upload directory with the current upload directory
     * and its corresponding owner object, if  it has primary key.
     *
     * @param change
     * @param oldUploadDir
     * @param uploadDir
     * @returns {*}
     */
    private updateDBChange(change: Change, oldUploadDir: string, uploadDir: string) {
        const modifiedProperties = {},
            entityName = change.params.entityName,
            dataModelName = change.params.dataModelName;
        change.params.data = mapValues(change.params.data, function (v, k) {
            let mv = v, isModified = false;
            if (isString(v)) {
                mv = replace(v, oldUploadDir, uploadDir);
                isModified = !isEqual(mv, v);
            } else { // @ts-ignore
                if (isObject(v) && v.wmLocalPath) {
                    // insertMultiPartData and updateMultiPartData
                    // @ts-ignore
                    mv = replace(v.wmLocalPath, oldUploadDir, uploadDir);
                    // @ts-ignore
                    isModified = !isEqual(mv, v.wmLocalPath);
                }
            }
            if (isModified) {
                modifiedProperties[k] = mv;
            }
            return mv;
        });
        if (!isEmpty(modifiedProperties)) {
            this.localDBManagementService.getStore(dataModelName, entityName)
                .then(store => {
                    // If there is a primary for the entity, then update actual row with the modifications
                    if (store.primaryKeyField && store.primaryKeyField.generatorType === 'identity') {
                        const primaryKeyName = store.primaryKeyName;
                        const primaryKey = change.params.data[primaryKeyName];
                        return store.get(primaryKey)
                            .then(obj => store.save(assignIn(obj, modifiedProperties)));
                    }
                }).then(() => {
                change.params = JSON.stringify(change.params);
                return this.changeLogService.getStore().then( store => store.save(change));
            });
        }
    }

    /**
     * This function check this change to update old upload directory path.
     *
     * @param change
     * @param metaInfo
     * @returns {*}
     */
    private updateChange(change: Change, metaInfo: any) {
        change.params = JSON.parse(change.params);
        if (change.service === 'OfflineFileUploadService'
            && change.operation === 'uploadToServer') {
            change.params.file = replace(change.params.file, metaInfo.uploadDir, this.uploadDir);
            change.params = JSON.stringify(change.params);
            return this.changeLogService.getStore().then( store => store.save(change));
        }
        if (change.service === 'DatabaseService') {
            return this.updateDBChange(change, metaInfo.uploadDir, this.uploadDir);
        }
    }

    /**
     * This function will visit all the changes and modify them, if necessary.
     * @param metaInfo
     * @param page
     * @returns {*}
     */
    private updateChanges(metaInfo: any, page = 1): Promise<any> {
        const size = 10;
        return this.getChanges(page, size)
            .then(changes => {
                if (changes && changes.length > 0) {
                    return Promise.all(changes.map(change => this.updateChange(change, metaInfo)));
                }
            }).then(result => {
                if (result && result.length === size) {
                    return this.updateChanges(metaInfo, page + 1);
                }
            });
    }
}
