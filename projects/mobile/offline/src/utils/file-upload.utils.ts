import { File } from '@ionic-native/file';

import { DeviceFileService, DeviceFileUploadService, IUploadResponse, NetworkService } from '@wm/mobile/core';

import { ChangeLogService } from '../services/change-log.service';

let isOfflineBehaviourAdded = false;

export class FileUploadOfflineBehaviour {

    constructor(
        private changeLogService: ChangeLogService,
        private deviceFileService: DeviceFileService,
        private deviceFileUploadService: DeviceFileUploadService,
        private file: File,
        private networkService: NetworkService,
        private uploadDir: string
    ) {

    }

    public add() {
        if (isOfflineBehaviourAdded) {
            return;
        }
        isOfflineBehaviourAdded = true;
        const orig = this.deviceFileUploadService.upload;
        this.deviceFileUploadService['uploadToServer'] = orig;
        this.deviceFileUploadService.upload = (url: string, fileParamName: string, localPath: string, fileName?: string, params?: any, headers?: any): Promise<IUploadResponse> => {
            if (this.networkService.isConnected()) {
                return orig.call(this.deviceFileUploadService, url, fileParamName, localPath, fileName, params, headers);
            } else {
                return this.uploadLater(url, fileParamName, localPath, fileName, params, headers).then(response => {
                    return {
                        text: JSON.stringify(response),
                        headers: null,
                        response: response
                    };
                });
            }
        };
    }

    public uploadLater(url: string, fileParamName: string, localPath: string, fileName?: string, params?: any, headers?: any): Promise<any> {
        const i = localPath.lastIndexOf('/'),
            soureDir = localPath.substring(0, i),
            soureFile = localPath.substring(i + 1),
            destFile = this.deviceFileService.appendToFileName(soureFile),
            filePath = this.uploadDir + '/' + destFile;
        return this.file.copyFile(soureDir, soureFile, this.uploadDir, destFile)
            .then(() => {
                return this.changeLogService.add('OfflineFileUploadService', 'uploadToServer', {
                    file: filePath,
                    ftOptions: {
                        fileKey: fileParamName,
                        fileName: fileName
                    },
                    params: params,
                    headers: headers,
                    serverUrl: url,
                    deleteOnUpload: true
                });
            }).then(() => {
                return [{
                    fileName: soureFile,
                    path: filePath,
                    length: 0,
                    success: true,
                    inlinePath: filePath + '?inline'
                }];
            });
    }
}
