import { LVService } from '@wm/variables';

import { NetworkService } from '@wm/mobile/core';
import { noop, triggerFn } from '@wm/core';

import { ChangeLogService } from '../services/change-log.service';
import { LocalDBManagementService } from '../services/local-db-management.service';
import { LocalDbService } from '../services/local-db.service';

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
                        this.localDBManagementService.isOperationAllowed(params.dataModelName, params.entityName, operation.type)
                            .then(isAllowedInOffline => {
                                if (this.networkService.isConnected() || params.onlyOnline || !isAllowedInOffline) {
                                    this.remoteDBcall(operation, params, successCallback, failureCallback);
                                } else {
                                    this.localDBcall(operation, params, successCallback, function () {
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
    private localDBcall(operation, params, successCallback, failureCallback) {
        this.offlineDBService[operation.name](params, response => {
            if (operation.type === 'READ') {
                triggerFn(successCallback, response);
            } else {
                // add to change log
                params.onlyOnline = true;
                this.changeLogService.add('DatabaseService', operation.name, params)
                    .then(() => triggerFn(successCallback, response), failureCallback);
            }
        }, failureCallback);
    }

    /*
     * During online, all read operations data will be pushed to offline database. Similarly, Update and Delete
     * operations are synced with the offline database.
     */
    private remoteDBcall(operation, params, successCallback, failureCallback) {
        this.onlineDBService[operation](params, response => {
            if (!params.skipLocalDB) {
                if (operation.type === 'READ') {
                    this.offlineDBService.getStore(params).then(store => {
                        store.saveAll(response.content);
                    });
                } else {
                    self[operation.name](params, noop, noop);
                }
            }
            triggerFn(successCallback, response);
        }, failureCallback);
    }
}