import { Injectable } from '@angular/core';

import { LocalDBManagementService } from './local-db-management.service';
import { LocalDBStore } from '../models/local-db-store';

declare const _;

@Injectable({providedIn: 'root'})
export class LocalDbService {

    private searchTableData;
    private searchTableDataWithQuery;

    constructor(private localDBManagementService: LocalDBManagementService) {
        this.searchTableData = this.readTableData.bind(this);
        this.searchTableDataWithQuery = this.readTableData.bind(this);
    }

    public getStore(params: any): Promise<LocalDBStore> {
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
    public insertTableData(params: any, successCallback?: any, failureCallback?: any) {
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
    public insertMultiPartTableData(params: any, successCallback?: any, failureCallback?: any) {
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
    public updateTableData(params: any, successCallback?: any, failureCallback?: any) {
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
    public updateMultiPartTableData(params: any, successCallback?: any, failureCallback?: any)  {
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
    public deleteTableData(params: any, successCallback?: any, failureCallback?: any) {
        this.getStore(params).then(store => {
            const pkField = store.primaryKeyField,
                id = params[pkField.fieldName] || params[pkField.name] || (params.data && params.data[pkField.fieldName]) || params.id;
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
    public readTableData(params: any, successCallback?: any, failureCallback?: any) {
        this.getStore(params).then(store => {
            let filter = params.filter((filterGroup, filterFields) => {
                this.convertFieldNameToColumnName(store, filterGroup, filterFields);
            }, true);
            // convert wm_bool function with boolean value to 0/1
            filter = filter.replace(/wm_bool\('true'\)/g, 1).replace(/wm_bool\('false'\)/g, 0);
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

    // returns the columnName appending with the schema name.
    private getColumnName(store, fieldName) {
        if (store.fieldToColumnMapping[fieldName]) {
            const columnName = this.escapeName(store.fieldToColumnMapping[fieldName]);
            if (columnName.indexOf('.') < 0) {
                return this.escapeName(store.entitySchema.name) + '.' + columnName;
            }
            return columnName;
        }
        return fieldName;
    }

    private convertFieldNameToColumnName(store: LocalDBStore, filterGroup: any, options?: any) {
        _.forEach(filterGroup.rules, rule => {
            if (rule.rules) {
                this.convertFieldNameToColumnName(store, rule);
            } else {
                rule.target = this.getColumnName(store, rule.target);
            }
        });
        // handling the scenario where variable options can have filterField. For example: search filter query
        if (options && options.filterFields) {
            options.filterFields = _.mapKeys(options.filterFields, (v, k) => {
                return this.getColumnName(store, k);
            });
        }
    }
}
