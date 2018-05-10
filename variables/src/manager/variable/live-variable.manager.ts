import {getClonedObject, triggerFn} from '@wm/core';

import { BaseVariableManager } from './base-variable.manager';
import { setInput, initiateCallback } from '../../util/variable/variables.utils';
import LiveVariableUtils from '../../util/variable/live-variable.utils';
import {$queue} from '../../util/inflight-queue';
import * as LVService from '../../util/variable/live-variable.http.utils';
import { $rootScope, VARIABLE_CONSTANTS, CONSTANTS } from '../../constants/variables.constants';

declare const _;
const emptyArr = [];

export class LiveVariableManager extends BaseVariableManager {

    private updateDataset (variable, data, propertiesMap, pagingOptions) {
        variable.dataSet = {data, propertiesMap, pagingOptions};
    }

    // Set the _options on variable which can be used by the widgets
    private setVariableOptions(variable, options) {
        variable._options = variable._options || {};
        variable._options.orderBy = options && options.orderBy;
        variable._options.filterFields = options && options.filterFields;
    }

    private handleError(variable, errorCB, response, options) {
        /* If callback function is provided, send the data to the callback.
         * The same callback if triggered in case of error also. The error-handling is done in grid.js*/
        triggerFn(errorCB, response);

        //  EVENT: ON_RESULT
        initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, response);

        /* update the dataSet against the variable */
        if (!options.skipDataSetUpdate) {
            this.updateDataset(variable, emptyArr, variable.propertiesMap, null);
        }

        //  EVENT: ON_ERROR
        initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, response);
        //  EVENT: ON_CAN_UPDATE
        variable.canUpdate = true;
        initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, response);
    }

    private getEntityData(variable, options, success, error) {
        const dataObj: any = {},
            _this = this;
        let tableOptions,
            dbOperation,
            promiseObj,
            output,
            newDataSet,
            clonedFields,
            requestData;

        clonedFields = getClonedObject(variable.filterFields);
        //  EVENT: ON_BEFORE_UPDATE
        output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, clonedFields);
        if (output === false) {
            $queue.process(variable);
            // $rootScope.$emit('toggle-variable-state', variable, false);
            triggerFn(error);
            return Promise.reject('Call stopped from the event: ' + VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE);
        }

        variable.canUpdate = false;

        tableOptions = LiveVariableUtils.prepareTableOptions(variable, options, _.isObject(output) ? output : clonedFields);

        //  if tableOptions object has query then set the dbOperation to 'searchTableDataWithQuery'
        if (options.searchWithQuery) {
            dbOperation = 'searchTableDataWithQuery';
            requestData = tableOptions.query ? ('q=' + tableOptions.query) : '';
        } else {
            dbOperation = (tableOptions.filter && tableOptions.filter.length) ? 'searchTableData' : 'readTableData';
            requestData = tableOptions.filter;
        }
        /* if it is a prefab variable (used in a normal project), modify the url */
        /*Fetch the table data*/
        promiseObj = LVService[dbOperation]({
            'projectID': $rootScope.project.id,
            'service': variable._prefabName ? '' : 'services',
            'dataModelName': variable.liveSource,
            'entityName': variable.type,
            'page': options.page || 1,
            'size': options.pagesize || (CONSTANTS.isRunMode ? (variable.maxResults || 20) : (variable.designMaxResults || 20)),
            'sort': tableOptions.sort,
            'data': requestData,
            'filterMeta': tableOptions.filter,
            'url': variable._prefabName ? ($rootScope.project.deployedUrl + '/prefabs/' + variable._prefabName) : $rootScope.project.deployedUrl
        }).then(function (response, xhrObj) {
            response = response.body;

            if ((response && response.error) || !response || !_.isArray(response.content)) {
                _this.handleError(variable, error, response.error, options);
                return Promise.reject(response.error);
            }

            LiveVariableUtils.processBlobColumns(response.content, variable);
            dataObj.data = response.content;
            dataObj.pagingOptions = {'dataSize': response ? response.totalElements : null, 'maxResults': variable.maxResults, 'currentPage': response ? (response.number + 1) : null};

            // if callback function is provided, send the data to the callback
            triggerFn(success, dataObj.data, variable.propertiesMap, dataObj.pagingOptions);

            if (!options.skipDataSetUpdate) {
                //  EVENT: ON_RESULT
                initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, dataObj.data);
                //  EVENT: ON_PREPARESETDATA
                newDataSet = initiateCallback(VARIABLE_CONSTANTS.EVENT.PREPARE_SETDATA, variable, dataObj.data);
                if (newDataSet) {
                    // setting newDataSet as the response to service variable onPrepareSetData
                    dataObj.data = newDataSet;
                }
                /* update the dataSet against the variable */
                _this.updateDataset(variable, dataObj.data, variable.propertiesMap, dataObj.pagingOptions);

                _this.setVariableOptions(variable, options);
                //  EVENT: ON_SUCCESS
                initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, dataObj.data);
                //  EVENT: ON_CAN_UPDATE
                variable.canUpdate = true;
                initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, dataObj.data);
            }
            return Promise.resolve({data: dataObj.data, propertiesMap: variable.propertiesMap, pagingOptions: dataObj.pagingOptions});
        }, function (errorMsg, details, xhrObj) {
            _this.setVariableOptions(variable, options);
            _this.handleError(variable, error, errorMsg, options);

            return Promise.reject(errorMsg);
        });

        variable.promise = promiseObj;
        return promiseObj;
    }

    private performCUD(operation, variable, options, success, error) {
        options = options || {};
        options.inputFields = options.row || getClonedObject(variable.inputFields);
        return $queue.submit(variable).then(function(){
            return LiveVariableUtils.doCUD(operation, variable, options, success, error)
                .then(function(response) {
                    $queue.process(variable);
                    return Promise.resolve(response);
                }, function(err) {
                    $queue.process(variable);
                    return Promise.reject(err);
                });
        }, error);
    }

    //*********************************************************** PUBLIC ***********************************************************//

    /**
     * Makes http call for a Live Variable against the configured DB Entity.
     * Gets the paginated records against the entity
     * @param variable
     * @param options
     * @param success
     * @param error
     * @returns {Promise<any>}: will be resolved on successful data fetch
     */
    public listRecords(variable, options, success, error) {
        options = options || {};
        options.filterFields = options.filterFields || getClonedObject(variable.filterFields);
        const _this = this;
        return $queue.submit(variable).then(function() {
            return _this.getEntityData(variable, options, success, error)
                .then(function(response) {
                    $queue.process(variable);
                    return Promise.resolve(response);
                }, function(err) {
                    $queue.process(variable);
                    return Promise.reject(err);
                });
        }, error);
    }

    /**
     * Makes a POST http call for a Live Variable against the configured DB Entity.
     * Sends a Table record object with the request body
     * the record is inserted into the entity at the backend
     * @param variable
     * @param options
     * @param success
     * @param error
     * @returns {Promise<any>}: will be resolved on successful data fetch
     */
    public insertRecord(variable, options, success, error) {
        return this.performCUD('insertTableData', variable, options, success, error);
    }

    /**
     * Makes a PUT http call for a Live Variable against the configured DB Entity.
     * Sends a Table record object with the request body against the primary key of an existing record
     * the record is updated into the entity at the backend
     * @param variable
     * @param options
     * @param success
     * @param error
     * @returns {Promise<any>}: will be resolved on successful data fetch
     */
    public updateRecord(variable, options, success, error) {
        return this.performCUD('updateTableData', variable, options, success, error);
    }

    /**
     * Makes a DELETE http call for a Live Variable against the configured DB Entity.
     * Sends the primary key of an existing record
     * the record is deleted from the entity at the backend
     * @param variable
     * @param options
     * @param success
     * @param error
     * @returns {Promise<any>}: will be resolved on successful data fetch
     */
    public deleteRecord(variable, options, success, error) {
        return this.performCUD('deleteTableData', variable, options, success, error);
    }

    /**
     * sets the value against passed key on the "inputFields" object in the variable
     * @param variable
     * @param key: can be:
     *  - a string e.g. "username"
     *  - an object, e.g. {"username": "john", "ssn": "11111"}
     * @param val
     * - if key is string, the value against it (for that data type)
     * - if key is object, not required
     * @param options
     * @returns {any}
     */
    public setInput(variable, key, val, options) {
        variable.inputFields = variable.inputFields || {};
        return setInput(variable.inputFields, key, val, options);
    }

    /**
     * sets the value against passed key on the "filterFields" object in the variable
     * @param variable
     * @param key: can be:
     *  - a string e.g. "username"
     *  - an object, e.g. {"username": "john", "ssn": "11111"}
     * @param val
     * - if key is string, the value against it (for that data type)
     * - if key is object, not required
     * @param options
     * @returns {any}
     */
    public setFilter(variable, key, val) {
        let paramObj = {},
            targetObj = {};
        if (_.isObject(key)) {
            paramObj = key;
        } else {
            paramObj[key] = val;
        }

        if (!variable.filterFields) {
            variable.filterFields = {};
        }
        targetObj = variable.filterFields;

        _.forEach(paramObj, function (paramVal, paramKey) {
            targetObj[paramKey] = {
                'value': paramVal
            };
        });

        return targetObj;
    }

    /**
     * Makes a file download call for a table
     * @param variable
     * @param options
     */
    public download(variable, options) {
        options = options || {};
        let tableOptions;
        const dbOperation = 'exportTableData',
            projectID   = $rootScope.project.id || $rootScope.projectName;
        options.searchWithQuery = true; // For export, query api is used. So set this flag to true
        tableOptions = LiveVariableUtils.prepareTableOptions(variable, options, undefined);
        LVService[dbOperation]({
            'projectID'     : projectID,
            'service'       : variable._prefabName ? '' : 'services',
            'dataModelName' : variable.liveSource,
            'entityName'    : variable.type,
            'sort'          : tableOptions.sort,
            'url'           : variable._prefabName ? ($rootScope.project.deployedUrl + '/prefabs/' + variable._prefabName) : $rootScope.project.deployedUrl,
            'data'          : tableOptions.query ? ('q=' + tableOptions.query) : '',
            'filterMeta'    : tableOptions.filter,
            'exportFormat'  : options.exportFormat,
            'size'          : options.size
        });
    }

    /**
     * gets primary keys against the passed related Table
     * @param variable
     * @param relatedField
     * @returns {any}
     */
    public getRelatedTablePrimaryKeys(variable, relatedField) {
        let primaryKeys,
            result,
            relatedCols;
        if (!variable.propertiesMap) {
            return;
        }
        result = _.find(variable.propertiesMap.columns || [], {'fieldName': relatedField});
        // if related field name passed, get its type from columns inside the current field
        if (result) {
            relatedCols = result.columns;
            primaryKeys = _.map(_.filter(relatedCols, 'isPrimaryKey'), 'fieldName');
            if (primaryKeys.length) {
                return primaryKeys;
            }
            if (relatedCols && relatedCols.length) {
                relatedCols = _.find(relatedCols, {'isRelated': false});
                return relatedCols && relatedCols.fieldName;
            }
        }
    }

    /**
     * Makes HTTP call to get the data for related entity of a field in an entity
     * @param variable
     * @param columnName
     * @param options
     * @param success
     * @param error
     */
    public getRelatedTableData(variable, columnName, options, success, error) {
        const projectID    = $rootScope.project.id || $rootScope.projectName;
        const relatedTable = _.find(variable.relatedTables, table => table.relationName === columnName || table.columnName === columnName); // Comparing column name to support the old projects
        const selfRelatedCols = _.map(_.filter(variable.relatedTables, o => o.type === variable.type), 'relationName');
        const filterFields = [];
        let orderBy,
            filterOptions,
            query,
            action;
        _.forEach(options.filterFields, (value, key) => {
            value.fieldName = key;
            value.type      = LiveVariableUtils.getFieldType(columnName, variable, key);
            filterFields.push(value);
        });
        filterOptions = LiveVariableUtils.getFilterOptions(variable, filterFields, options);
        query         = LiveVariableUtils.getSearchQuery(filterOptions, ' ' + (options.logicalOp || 'AND') + ' ', variable.ignoreCase);
        query         = query ? ('q=' + query) : '';
        action        = 'searchTableDataWithQuery';
        orderBy       = _.isEmpty(options.orderBy) ? '' : 'sort=' + options.orderBy;
        return LVService[action]({
            'projectID'     : projectID,
            'service'       : variable._prefabName ? '' : 'services',
            'dataModelName' : variable.liveSource,
            'entityName'    : relatedTable.type,
            'page'          : options.page || 1,
            'size'          : options.pagesize || undefined,
            'url'           : variable._prefabName ? ($rootScope.project.deployedUrl + '/prefabs/' + variable._prefabName) : $rootScope.project.deployedUrl,
            'data'          : query || '',
            'filterMeta'    : filterOptions,
            'sort'          : orderBy
        }).then(res => {
            const response = res.body;
            /*Remove the self related columns from the data. As backend is restricting the self related column to one level, In liveform select, dataset and datavalue object
            * equality does not work. So, removing the self related columns to acheive the quality*/
            const data = _.map(response.content, o => _.omit(o, selfRelatedCols));
            triggerFn(success, data, undefined, response ? {'dataSize': response.totalElements, 'maxResults': response.size, 'currentPage': response.number + 1} : {});
            return Promise.resolve(data);
        }, (errMsg) => {
            triggerFn(error, errMsg);
            return Promise.reject(errMsg);
        });
    }

    /**
     * Gets the distinct records for an entity
     * @param variable
     * @param options
     * @param success
     * @param error
     */
    public getDistinctDataByFields(variable, options, success, error) {
        const dbOperation = 'getDistinctDataByFields';
        const projectID   = $rootScope.project.id || $rootScope.projectName;
        const requestData: any = {};
        let sort;
        let tableOptions;
        options.skipEncode = true;
        options.operation  = 'read';
        options = options || {};
        tableOptions = LiveVariableUtils.prepareTableOptions(variable, options);
        if (tableOptions.query) {
            requestData.filter = tableOptions.query;
        }
        requestData.groupByFields = _.isArray(options.fields) ? options.fields : [options.fields];
        sort = options.sort ||  requestData.groupByFields[0] + ' asc';
        sort = sort ? 'sort=' + sort : '';

        return LVService[dbOperation]({
            'projectID'     : projectID,
            'service'       : variable._prefabName ? '' : 'services',
            'dataModelName' : variable.liveSource,
            'entityName'    : options.entityName || variable.type,
            'page'          : options.page || 1,
            'size'          : options.pagesize,
            'sort'          : sort,
            'data'          : requestData,
            'url'           : variable._prefabName ? ($rootScope.project.deployedUrl + '/prefabs/' + variable._prefabName) : $rootScope.project.deployedUrl
        }).then(response => {
            if ((response && response.error) || !response) {
                triggerFn(error, response.error);
                return Promise.reject(response.error);
            }
            triggerFn(success, response.body);
            return Promise.resolve(response.body);
        }, errorMsg => {
            triggerFn(error, errorMsg);
            return Promise.reject(errorMsg);
        });
    }

    public defineFirstLastRecord(variable) {
        if (variable.operation === 'read') {
            Object.defineProperty(variable, 'firstRecord', {
                'configurable': true,
                'get': function () {
                    return _.get(variable.dataSet, 'data[0]', {});
                }
            });
            Object.defineProperty(variable, 'lastRecord', {
                'configurable': true,
                'get': function () {
                    const data = _.get(variable.dataSet, 'data', []);
                    return data[data.length - 1];
                }
            });
        }
    }

    public getPrimaryKey(variable) {
        return LiveVariableUtils.getPrimaryKey(variable);
    }
}