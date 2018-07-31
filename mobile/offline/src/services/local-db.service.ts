import { Injectable } from '@angular/core';

import { LocalDBManagementService } from './local-db-management.service';
import { LocalDBStore } from '../models/local-db-store';

declare const _;

@Injectable()
export class LocalDbService {

    constructor(private localDBManagementService: LocalDBManagementService) {

    }

    public getStore(params: any) {
        return this.localDBManagementService.getStore(params.dataModelName, params.entityName);
    }

    /**
     * Method to insert data into the specified table. This modification will be added to offline change log.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be inserted.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    public insertTableData(params: any, successCallback?: Function, failureCallback?: Function) {
        this.getStore(params).then(store => {
            const isPKAutoIncremented = (store.primaryKeyField && store.primaryKeyField.generatorType === 'identity');
            if (isPKAutoIncremented && params.data[store.primaryKeyName]) {
                delete params.data[store.primaryKeyName];
            }
            return store.add(params.data).then(localId => {
                if (isPKAutoIncremented) {
                    params.data[store.primaryKeyName] = localId;
                }
                if (successCallback) {
                    successCallback(params.data);
                }
            });
        }).catch(failureCallback);
    }

    /**
     * Method to insert multi part data into the specified table. This modification will be added to offline change log.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be inserted.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    public insertMultiPartTableData(params: any, successCallback?: Function, failureCallback?: Function) {
        this.getStore(params).then(store => {
            store.serialize(params.data).then(data => {
                params.data = data;
                this.insertTableData(params, successCallback, failureCallback);
            });
        }).catch(failureCallback);
    }

    /**
     * Method to update data in the specified table. This modification will be added to offline change log.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be updated.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    public updateTableData(params: any, successCallback?: Function, failureCallback?: Function) {
        this.getStore(params).then(store => {
            return store.save(params.data);
        }).then(() => {
            if (successCallback) {
                successCallback(params.data);
            }
        }).catch(failureCallback);
    }

    /**
     * Method to update multi part data in the specified table. This modification will be added to offline change log.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be updated.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    public updateMultiPartTableData(params: any, successCallback?: Function, failureCallback?: Function)  {
        const data = (params.data && params.data.rowData) || params.data;
        this.getStore(params).then(store => {
            return store.save(data);
        }).then(() => {
            if (successCallback) {
                successCallback(data);
            }
        }).catch(failureCallback);
    }

    /**
     * Method to delete data in the specified table. This modification will be added to offline change log.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be inserted.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    public deleteTableData(params: any, successCallback?: Function, failureCallback?: Function) {
        this.getStore(params).then(store => {
            const pkField = store.primaryKeyField,
                id = params[pkField.fieldName] || params[pkField.name];
            store.delete(id).then(successCallback);
        }).catch(failureCallback);
    }

    /**
     * Method to read data from a specified table.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be inserted.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    public readTableData(params: any, successCallback?: Function, failureCallback?: Function) {
        this.getStore(params).then(store => {
            const filter = params.filter(filterGroup => {
                this.convertFieldNameToColumnName(store, filterGroup);
            });
            return store.count(filter).then(totalElements => {
                const sort = params.sort.split('=')[1];
                return store.filter(filter, sort, {
                    offset: (params.page - 1) * params.size,
                    limit: params.size
                }).then(data => {
                    const totalPages = Math.ceil(totalElements / params.size);
                    successCallback({
                        'content'         : data,
                        'first'           : (params.page === 1),
                        'last'            : (params.page === totalPages),
                        'number'          : (params.page - 1),
                        'numberOfElements': data.length,
                        'size'            : params.size,
                        'sort'            : {
                            'sorted' : !!sort,
                            'unsorted' : !sort
                        },
                        'totalElements'   : totalElements,
                        'totalPages'      : totalPages
                    });
                });
            });
        }).catch(failureCallback);
    }

    private escapeName(name: string): string {
        if (name) {
            name = name.replace(/"/g, '""');
            return '"' + name.replace(/\./g, '"."') + '"';
        }
        return name;
    }

    private convertFieldNameToColumnName(store: LocalDBStore, filterGroup: any) {
        _.forEach(filterGroup.rules, rule => {
            if (rule.rules) {
                this.convertFieldNameToColumnName(store, rule);
            } else {
                rule.target = this.escapeName(store.fieldToColumnMapping[rule.target]);
            }
        });
    }
}