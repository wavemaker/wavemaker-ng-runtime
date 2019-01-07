import { LVService } from '@wm/variables';

import { NetworkService } from '@wm/mobile/core';
import { noop, triggerFn } from '@wm/core';

import { ColumnInfo, ForeignRelationInfo } from '../models/config';
import { LocalDBStore } from '../models/local-db-store';
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
                                    let cascader;
                                    return Promise.resolve().then(() => {
                                        if (!params.isCascadingStopped &&
                                            (operation.name === 'insertTableData'
                                                || operation.name === 'updateTableData')) {
                                            return this.prepareToCascade(params).then(c => cascader = c);
                                        }
                                    }).then(() => {
                                        return new Promise((resolve, reject) => {
                                            this.localDBcall(operation, params, resolve, reject);
                                        });
                                    }).then( response => {
                                        if (cascader) {
                                            cascader.cascade().then(() => response);
                                        }
                                        return response;
                                    }).then(successCallback,  () => {
                                            triggerFn(failureCallback, 'Service call failed');
                                    });
                                }
                            });
                    };
                }
            });
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
            triggerFn(successCallback, response);
            return response;
        }, failureCallback);
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
                        if (c.foreignRelations) {
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
                        return () => {
                            return Promise.resolve().then(() => {
                                    const primaryKeyValue = childStore.getValue(childParams.data, childStore.primaryKeyField.fieldName);
                                    return primaryKeyValue ? childStore.get(primaryKeyValue) : null;
                                }).then(object => {
                                    return new Promise((resolve, reject) => {
                                        let operation;
                                        if (object) {
                                            operation = childParams.hasBlob ? 'updateMultiPartTableData' : 'updateTableData';
                                        } else {
                                            operation = childParams.hasBlob ? 'insertMultiPartTableData' : 'insertTableData';
                                        }
                                        this.onlineDBService[operation](childParams, resolve, reject);
                                    });
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
