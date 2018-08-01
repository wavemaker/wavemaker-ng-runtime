import { File } from '@ionic-native/file';

import { DeviceFileService, DeviceFileUploadService, NetworkService, UploadRequest } from '@wm/mobile/core';

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
        this.deviceFileUploadService.upload = (url: string, fileParamName: string, localPath: string, fileName?: string): UploadRequest => {
            if (this.networkService.isConnected()) {
                return orig.call(this.deviceFileUploadService, url, fileParamName, localPath, fileName);
            } else {
                const i = localPath.lastIndexOf('/'),
                    soureDir = localPath.substring(0, i),
                    soureFile = localPath.substring(i + 1),
                    destFile = this.deviceFileService.appendToFileName(soureFile),
                    filePath = this.uploadDir + '/' + destFile;
                this.file.copyFile(soureDir, soureFile, this.uploadDir, destFile)
                    .then(() => {
                        return this.changeLogService.add('OfflineFileUploadService', 'uploadToServer', {
                            'file'     : filePath,
                            'serverUrl': url,
                            'deleteOnUpload' : true
                        });
                    });
                const req = orig.call(this.deviceFileUploadService, url, fileParamName, localPath, fileName);
                const response = JSON.stringify({
                    fileName: soureFile,
                    path: filePath,
                    length: 0,
                    success: true,
                    inlinePath: filePath + '?inline'
                });
                req.post = () => Promise.resolve({
                    text: JSON.stringify(response),
                    headers: null,
                    response: response
                });
                return req;
            }
        };
    }

}