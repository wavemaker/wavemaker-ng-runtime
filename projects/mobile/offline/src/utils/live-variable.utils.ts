import { from } from 'rxjs';

import { LVService } from '@wm/variables';

import { NetworkService } from '@wm/mobile/core';
import { AbstractHttpService, noop, triggerFn } from '@wm/core';

import { ColumnInfo, ForeignRelationInfo } from '../models/config';
import { LocalDBStore } from '../models/local-db-store';
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
        'type' : 'READ',
        'saveResponse': true
    }, {
        'name' : 'searchTableData',
        'type' : 'READ',
        'saveResponse': true
    }, {
        'name' : 'searchTableDataWithQuery',
        'type' : 'READ',
        'saveResponse': true
    }, {
        'name' : 'getDistinctDataByFields',
        'type' : 'READ',
        'saveResponse': false
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
                this.httpService.sendCallAsObservable = (reqParams, params): any => {
                    if (!params && _.get(reqParams, 'url')) {
                        params = {url: reqParams.url};
                    }
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
                            if (!isAllowedInOffline) {
                                return this.remoteDBcall(operation, onlineHandler, params);
                            } else {
                                let cascader;
                                return Promise.resolve().then(() => {
                                    if (!params.isCascadingStopped &&
                                        (operation.name === 'insertTableData'
                                            || operation.name === 'updateTableData')) {
                                        return this.prepareToCascade(params).then(c => cascader = c);
                                    }
                                }).then(() => {
                                    return new Promise((resolve, reject) => {
                                        this.localDBcall(operation, params, resolve, reject, clonedParamsUrl);
                                    });
                                }).then( (response: any) => {
                                    if (cascader) {
                                        return cascader.cascade().then(() => {
                                            return this.getStore(params).then(store => {
                                                return store.refresh(response.body);
                                            }).then(data => {
                                                // data includes parent and child data.
                                                if (response && response.body) {
                                                    response.body = data;
                                                }
                                                return response;
                                            });
                                        });
                                    }
                                    return response;
                                });
                            }
                        }));
                };
            }
        }
    }

    public getStore(params: any): Promise<LocalDBStore> {
        return this.localDBManagementService.getStore(params.dataModelName, params.entityName);
    }

    // set hasBlob flag on params when blob field is present
    private hasBlob(store) {
        const blobColumns = _.filter(store.entitySchema.columns, {
            'sqlType' : 'blob'
        });
        return !!blobColumns.length;
    }

    /*
     * During offline, LocalDBService will answer to all the calls. All data modifications will be recorded
     * and will be reported to DatabaseService when device goes online.
     */
    private localDBcall(operation, params, successCallback, failureCallback, clonedParamsUrl): Promise<any> {
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
            triggerFn(successCallback, response);
            return response;
        }, failureCallback);
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
                            if (operation.type === 'READ' && operation.saveResponse) {
                                store.saveAll(response.body.content);
                            } else if (operation.type === 'INSERT') {
                                params = _.clone(params);
                                params.data = _.clone(response.body);
                                this.offlineDBService[operation.name](params, noop, noop, {
                                    resetPrimaryKey: false
                                });
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

    /**
     * Finds out the nested objects to save and prepares a cloned params.
     */
    private prepareToCascade(params): Promise<any> {
        return this.getStore(params).then(store => {
            const childObjectPromises = [];
            _.forEach(params.data, (v, k) => {
                let column: ColumnInfo,
                    foreignRelation: ForeignRelationInfo,
                    childParams;
                // NOTE: Save only one-to-one relations for cascade
                if (_.isObject(v) && !_.isArray(v)) {
                    column = store.entitySchema.columns.find(c => {
                        if (c.primaryKey && c.foreignRelations) {
                            foreignRelation = c.foreignRelations.find( f => f.sourceFieldName === k);
                        }
                        return !!foreignRelation;
                    });
                }
                if (column) {
                    childParams = _.cloneDeep(params);
                    childParams.entityName = foreignRelation.targetEntity;
                    childParams.data = v;
                    const childPromise = this.getStore(childParams).then(childStore => {
                        const parent = params.data;
                        const targetColumns = childStore.entitySchema.columns.find(c => c.name === foreignRelation.targetColumn);
                        if (targetColumns && targetColumns.foreignRelations) {
                            const parentFieldName = targetColumns.foreignRelations.find( f => f.targetTable === store.entitySchema.name).sourceFieldName;
                            childParams.data[parentFieldName] = parent;
                        }
                        parent[k] = null;
                        childParams.onlyOnline = false;
                        childParams.isCascadingStopped = true;
                        childParams.hasBlob = this.hasBlob(childStore);
                        childParams.url = '';
                        return () => {
                            return Promise.resolve().then(() => {
                                    const primaryKeyValue = childStore.getValue(childParams.data, childStore.primaryKeyField.fieldName);
                                    return primaryKeyValue ? childStore.get(primaryKeyValue) : null;
                                }).then(object => {
                                    let operation;
                                    if (object) {
                                        operation = childParams.hasBlob ? 'updateMultiPartTableData' : 'updateTableData';
                                    } else {
                                        operation = childParams.hasBlob ? 'insertMultiPartTableData' : 'insertTableData';
                                    }
                                    return this.onlineDBService[operation](childParams).toPromise();
                                });
                        };
                    });
                    childObjectPromises.push(childPromise);
                }
            });
            return Promise.all(childObjectPromises).then(result => {
                return {
                    cascade: () => Promise.all(result.map(fn => fn()))
                };
            });
        });
    }
}
