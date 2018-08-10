import { LVService } from '@wm/variables';

import { NetworkService } from '@wm/mobile/core';
import { noop, triggerFn } from '@wm/core';

import { ChangeLogService } from '../services/change-log.service';
import { LocalDBManagementService } from '../services/local-db-management.service';
import { LocalDbService } from '../services/local-db.service';

declare const _;

const apiConfiguration = [{
        'name' : 'insertTableData',
        'type' : 'INSERT'
    }, {
        'name' : 'insertMultiPartTableData',
        'type' : 'INSERT'
    }, {
        'name' : 'updateTableData',
        'type' : 'UPDATE'
    }, {
        'name' : 'updateMultiPartTableData',
        'type' : 'UPDATE'
    }, {
        'name' : 'deleteTableData',
        'type' : 'DELETE'
    }, {
        'name' : 'readTableData',
        'type' : 'READ'
    }, {
        'name' : 'searchTableData',
        'type' : 'READ'
    }, {
        'name' : 'searchTableDataWithQuery',
        'type' : 'READ'
    }];

let isOfflineBehaviorAdded = false;

export class LiveVariableOfflineBehaviour {

    private onlineDBService = LVService;

    constructor(
        private changeLogService: ChangeLogService,
        private localDBManagementService: LocalDBManagementService,
        private networkService: NetworkService,
        private offlineDBService: LocalDbService
    ) {}

    public add () {
        if (!isOfflineBehaviorAdded) {
            isOfflineBehaviorAdded = true;
            apiConfiguration.forEach(operation => {
                const onlineHandler = LVService[operation.name];
                if (onlineHandler) {
                    LVService[operation.name] = (params, successCallback, failureCallback) => {
                        return this.localDBManagementService.isOperationAllowed(params.dataModelName, params.entityName, operation.type)
                            .then(isAllowedInOffline => {
                                if (this.networkService.isConnected() || params.onlyOnline || !isAllowedInOffline) {
                                    return this.remoteDBcall(operation, onlineHandler, params, successCallback, failureCallback);
                                } else {
                                    return this.localDBcall(operation, params, successCallback, function () {
                                        triggerFn(failureCallback, 'Service call failed');
                                    });
                                }
                            });
                    };
                }
            });
        }
    }

    /*
     * During offline, LocalDBService will answer to all the calls. All data modifications will be recorded
     * and will be reported to DatabaseService when device goes online.
     */
    private localDBcall(operation, params, successCallback, failureCallback): Promise<any> {
        return new Promise((resolve, reject) => {
            this.offlineDBService[operation.name](params, response => {
                if (operation.type === 'READ') {
                    resolve(response);
                } else {
                    // add to change log
                    params.onlyOnline = true;
                    return this.changeLogService.add('DatabaseService', operation.name, params)
                        .then(() => resolve(response));
                }
            });
        }).then((response) => {
            response = {body : response};
            triggerFn(successCallback, response);
            return response;
        }, failureCallback);
    }

    /*
     * During online, all read operations data will be pushed to offline database. Similarly, Update and Delete
     * operations are synced with the offline database.
     */
    private remoteDBcall(operation, onlineHandler, params, successCallback, failureCallback): Promise<any> {
        return onlineHandler(params, null, null).then(response => {
            if (!params.skipLocalDB) {
                if (operation.type === 'READ') {
                    this.offlineDBService.getStore(params).then(store => {
                        store.saveAll(response.body.content);
                    });
                } else if (operation.type === 'INSERT') {
                    params = _.clone(params);
                    params.data = _.clone(response.body);
                    this.offlineDBService[operation.name](params, noop, noop);
                } else {
                    this.offlineDBService[operation.name](params, noop, noop);
                }
            }
            triggerFn(successCallback, response);
            return response;
        }, failureCallback);
    }
}