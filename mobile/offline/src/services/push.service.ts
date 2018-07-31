import { Injectable } from '@angular/core';

import { Change, PushService } from './change-log.service';

@Injectable()
export class PushServiceImpl implements PushService {

    public push(change: Change): Promise<any> {
        switch (change.service) {
            case 'DatabaseService':
                switch (change.operation) {
                    case 'insertTableData':
                        break;
                    case 'updateTableData':
                        break;
                    case 'deleteTableData':
                        break;
                }
                break;
            case 'FileUploadService':
                break;
            default:
                return Promise.reject( `${change.service} service is not supported`);
        }
        return Promise.resolve('Coming Soon');
    }
}