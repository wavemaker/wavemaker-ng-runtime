import { from } from 'rxjs';
import { LVService } from '@wm/variables';

import { NetworkService } from '@wm/mobile/core';
import { AbstractHttpService, noop, triggerFn } from '@wm/core';

import { ChangeLogService } from '../services/change-log.service';
import { LocalDBManagementService } from '../services/local-db-management.service';
import { LocalDbService } from '../services/local-db.service';
import { WM_LOCAL_OFFLINE_CALL } from './utils';

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
        private httpService: AbstractHttpService,
        private localDBManagementService: LocalDBManagementService,
        private networkService: NetworkService,
        private offlineDBService: LocalDbService
    ) {}

    public add () {
        if (!isOfflineBehaviorAdded) {
            isOfflineBehaviorAdded = true;
            const onlineHandler = this.httpService.sendCallAsObservable;
            if (onlineHandler) {
                this.httpService.sendCallAsObservable = (reqParams, params) => {
                    // reqParams will contain the full path of insert/update call which will be processed again in parseConfig method
                    // and will be appended again with '/services/./.' which will result in deployedUrl + '/service/./.' + '/service/./.' which is wrong.
                    // Hence passing url in params
                    const clonedParamsUrl = _.clone(params.url);
                    params = _.extend(params, reqParams);
                    const operation = _.find(apiConfiguration, {name: _.get(params, 'operation')});
                    if (this.networkService.isConnected() || params.onlyOnline || !operation || !params.dataModelName) {
                        return from(this.remoteDBcall(operation, onlineHandler, params));
                    }
                    // converting promise to observable as LVService returns a observable
                    return from(this.localDBManagementService.isOperationAllowed(params.dataModelName, params.entityName, operation.type)
                        .then(isAllowedInOffline => {
                            if (this.networkService.isConnected() || params.onlyOnline || !isAllowedInOffline) {
                                return this.remoteDBcall(operation, onlineHandler, params);
                            } else {
                                return this.localDBcall(operation, params, clonedParamsUrl);
                            }
                        }));
                };
            }
        }
    }

    /*
     * During offline, LocalDBService will answer to all the calls. All data modifications will be recorded
     * and will be reported to DatabaseService when device goes online.
     */
    private localDBcall(operation, params, clonedParamsUrl): Promise<any> {
        return new Promise((resolve, reject) => {
            this.offlineDBService[operation.name](params, response => {
                if (operation.type === 'READ') {
                    resolve(response);
                } else {
                    // add to change log
                    params.onlyOnline = true;
                    params.url = clonedParamsUrl;
                    return this.changeLogService.add('DatabaseService', operation.name, params)
                        .then(() => resolve(response));
                }
            });
        }).then((response) => {
            response = {body : response, type: WM_LOCAL_OFFLINE_CALL};
            return response;
        });
    }

    /*
     * During online, all read operations data will be pushed to offline database. Similarly, Update and Delete
     * operations are synced with the offline database.
     */
    private remoteDBcall(operation, onlineHandler, params): Promise<any> {
        return new Promise((resolve, reject) => {
            onlineHandler.call(this.httpService, params).subscribe(response => {
                if (response && response.type) {
                    if (!params.skipLocalDB) {
                        this.offlineDBService.getStore(params).then((store) => {
                            if (operation.type === 'READ') {
                                store.saveAll(response.body.content);
                            } else if (operation.type === 'INSERT') {
                                params = _.clone(params);
                                params.data = _.clone(response.body);
                                this.offlineDBService[operation.name](params, noop, noop);
                            } else {
                                this.offlineDBService[operation.name](params, noop, noop);
                            }
                        }).catch(noop);
                    }
                    resolve(response);
                }
            }, (err) => {
                reject(err);
            });
        });
    }
}