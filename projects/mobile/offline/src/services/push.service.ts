import { Injectable } from '@angular/core';


import { DeviceFileUploadService } from '@wm/mobile/core';
import { LVService } from '@wm/variables';

import { Change, PushService } from './change-log.service';

@Injectable()
export class PushServiceImpl implements PushService {

    constructor(
        private deviceFileUploadService: DeviceFileUploadService
    ) {}

    public push(change: Change): Promise<any> {
        const params = change.params;
        switch (change.service) {
            case 'DatabaseService':
                switch (change.operation) {
                    case 'insertTableData':
                        return LVService.insertTableData(change.params, null, null);
                    case 'insertMultiPartTableData':
                        return LVService.insertMultiPartTableData(change.params, null, null);
                    case 'updateTableData':
                        return LVService.updateTableData(change.params, null, null);
                    case 'updateMultiPartTableData':
                        return LVService.updateMultiPartTableData(change.params, null, null);
                    case 'deleteTableData':
                        return LVService.deleteTableData(change.params, null, null);
                }
                case 'OfflineFileUploadService':
                    if (change.operation === 'uploadToServer') {
                        return this.deviceFileUploadService['uploadToServer'].call(
                            this.deviceFileUploadService,
                            params.serverUrl,
                            params.ftOptions.fileKey,
                            params.file,
                            params.ftOptions.fileName,
                            params.params,
                            params.headers);
                    }
            }
        return Promise.reject( `${change.service} service with operation ${change.operation} is not supported for push.`);
    }
}
