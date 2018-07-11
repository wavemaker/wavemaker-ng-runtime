import { $invokeWatchers, getClonedObject, processFilterExpBindNode, triggerFn } from '@wm/core';
import { appManager, DB_CONSTANTS } from '@wm/variables';

import { BaseVariableManager } from './base-variable.manager';
import { debounceVariableCall, formatExportExpression, initiateCallback, setInput } from '../../util/variable/variables.utils';
import LiveVariableUtils from '../../util/variable/live-variable.utils';
import { $queue } from '../../util/inflight-queue';
import * as LVService from '../../util/variable/live-variable.http.utils';
import { $rootScope, CONSTANTS, VARIABLE_CONSTANTS } from '../../constants/variables.constants';

declare const _;
const emptyArr = [];

export class LiveVariableManager extends BaseVariableManager {

    public initFilterExpressionBinding(variable) {
        const context = variable._context;
        const destroyFn = context.registerDestroyListener ? context.registerDestroyListener.bind(context) : _.noop;

        const filterSubscription = processFilterExpBindNode(context, variable.filterExpressions).subscribe((response: any) => {
            if (variable.operation === 'read') {
                /* if auto-update set for the variable with read operation only, get its data */
                if (variable.autoUpdate && !_.isUndefined(response.newVal) && _.isFunction(variable.update)) {
                    debounceVariableCall(variable, 'update');
                }
            } else {
                /* if auto-update set for the variable with read operation only, get its data */
                if (variable.autoUpdate && !_.isUndefined(response.newVal) && _.isFunction(variable[variable.operation + 'Record'])) {
                    debounceVariableCall(variable, variable.operation + 'Record');
                }
            }
        });

        destroyFn(() => filterSubscription.unsubscribe());
    }

    private updateDataset(variable, data, propertiesMap, pagingOptions) {
        variable.pagingOptions = pagingOptions;
        variable.dataSet = data;

        // legacy properties in dataSet, [data, pagingOptions]
        Object.defineProperty(variable.dataSet, 'data', {
            get: () => {
                return variable.dataSet;
            }
        });
        Object.defineProperty(variable.dataSet, 'pagingOptions', {
            get: () => {
                return variable.pagingOptions;
            }
        });
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
        initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, response, options.errorDetails);
        //  EVENT: ON_CAN_UPDATE
        variable.canUpdate = true;
        initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, response);
    }

    /**
     * Traverses recursively the filterExpressions object and if there is any required field present with no value,
     * then we will return without proceeding further. Its upto the developer to provide the mandatory value,
     * if he wants to assign it in teh onbefore<delete/insert/update>function then make that field in
     * the filter query section as optional
     * @param filterExpressions - recursive rule Object
     * @returns {Object} object or boolean. Object if everything gets validated or else just boolean indicating failure in the validations
     */
    private getFilterExprFields = function (filterExpressions) {
        let isRequiredFieldAbsent = false;
        const traverseCallbackFn = function (parentFilExpObj, filExpObj) {
            if (filExpObj
                && filExpObj.required
                && ((_.indexOf(['null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'], filExpObj.matchMode) === -1) && filExpObj.value === '')) {
                isRequiredFieldAbsent = true;
                return false;
            }
        };
        LiveVariableUtils.traverseFilterExpressions(filterExpressions, traverseCallbackFn);
        return isRequiredFieldAbsent ? !isRequiredFieldAbsent : filterExpressions;
    };

    /**
     * Allows the user to get the criteria of filtering and the filter fields, based on the method called
     */
    private getDataFilterObj = function (clonedFilterFields) {
        return (function (clonedFields) {
            function getCriteria(filterField) {
                const criterian = [];
                LiveVariableUtils.traverseFilterExpressions(clonedFields, function (filterExpressions, criteria) {
                    if (filterField === criteria.target) {
                        criterian.push(criteria);
                    }
                });
                return criterian;
            }

            function getFilterFields() {
                return clonedFields;
            }

            return {
                getFilterFields: getFilterFields,
                getCriteria: getCriteria
            };
        }(clonedFilterFields));
    };

    private getEntityData(variable, options, success, error) {
        const dataObj: any = {};
        let tableOptions,
            dbOperation,
            promiseObj,
            output,
            newDataSet,
            clonedFields,
            requestData;

        // empty array kept (if variable is not of read type filterExpressions will be undefined)
        clonedFields = this.getFilterExprFields(getClonedObject(variable.filterExpressions || {}));
        // clonedFields = getClonedObject(variable.filterFields);
        //  EVENT: ON_BEFORE_UPDATE
        output = initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, this.getDataFilterObj(clonedFields), options);
        if (output === false) {
            $queue.process(variable);
            // $rootScope.$emit('toggle-variable-state', variable, false);
            triggerFn(error, 'Call stopped from the event: ' + VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE);
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
            'service': variable.getPrefabName() ? '' : 'services',
            'dataModelName': variable.liveSource,
            'entityName': variable.type,
            'page': options.page || 1,
            'size': options.pagesize || (CONSTANTS.isRunMode ? (variable.maxResults || 20) : (variable.designMaxResults || 20)),
            'sort': tableOptions.sort,
            'data': requestData,
            'filter': LiveVariableUtils.getWhereClauseGenerator(variable, options),
            // 'filterMeta': tableOptions.filter,
            'url': variable.getPrefabName() ? ($rootScope.project.deployedUrl + '/prefabs/' + variable.getPrefabName()) : $rootScope.project.deployedUrl
        }).then((response) => {
            response = response.body;

            if ((response && response.error) || !response || !_.isArray(response.content)) {
                this.handleError(variable, error, response.error, options);
                return Promise.reject(response.error);
            }

            LiveVariableUtils.processBlobColumns(response.content, variable);
            dataObj.data = response.content;
            dataObj.pagingOptions = _.omit(response, 'content');

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
                this.updateDataset(variable, dataObj.data, variable.propertiesMap, dataObj.pagingOptions);
                this.setVariableOptions(variable, options);

                // watchers should get triggered before calling onSuccess event.
                // so that any variable/widget depending on this variable's data is updated
                $invokeWatchers(true);
                setTimeout(() => {
                    // if callback function is provided, send the data to the callback
                    triggerFn(success, dataObj.data, variable.propertiesMap, dataObj.pagingOptions);

                    //  EVENT: ON_SUCCESS
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, dataObj.data);
                    //  EVENT: ON_CAN_UPDATE
                    variable.canUpdate = true;
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, dataObj.data);
                });
            }
            return Promise.resolve({data: dataObj.data, pagingOptions: dataObj.pagingOptions});
        }, (e) => {
            this.setVariableOptions(variable, options);
            this.handleError(variable, error, e.error, _.extend(options, {errorDetails: e.details}));

            return Promise.reject(e.error);
        });

        variable.promise = promiseObj;
        return promiseObj;
    }

    private performCUD(operation, variable, options, success, error) {
        options = options || {};
        options.inputFields = options.inputFields || getClonedObject(variable.inputFields);
        return $queue.submit(variable).then(() => {
            this.notifyInflight(variable, true);
            return LiveVariableUtils.doCUD(operation, variable, options, success, error)
                .then((response) => {
                    $queue.process(variable);
                    this.notifyInflight(variable, false, response);
                    return Promise.resolve(response);
                }, (err) => {
                    $queue.process(variable);
                    this.notifyInflight(variable, false, err);
                    return Promise.reject(err);
                });
        }, error);
    }

    private aggregateData(deployedUrl, variable, options, success, error) {
        let tableOptions;
        const dbOperation = 'executeAggregateQuery';
        options = options || {};
        options.skipEncode = true;
        if (variable.filterFields) {
            tableOptions = LiveVariableUtils.prepareTableOptions(variable, options);
            options.aggregations.filter = tableOptions.query;
        }

        return LVService[dbOperation]({
            'dataModelName': variable.liveSource,
            'entityName': variable.type,
            'page': options.page || 1,
            'size': options.size || variable.maxResults,
            'sort': options.sort || '',
            'url': deployedUrl,
            'data': options.aggregations
        }, (response) => {
            if ((response && response.error) || !response) {
                triggerFn(error, response.error);
                return;
            }
            triggerFn(success, response);
        }, (errorMsg) => {
            triggerFn(error, errorMsg);
        });
    }


    // *********************************************************** PUBLIC ***********************************************************//

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
        return $queue.submit(variable).then(() => {
            this.notifyInflight(variable, true);
            return this.getEntityData(variable, options, success, error)
                .then((response) => {
                    $queue.process(variable);
                    this.notifyInflight(variable, false, response);
                    return Promise.resolve(response);
                }, (err) => {
                    $queue.process(variable);
                    this.notifyInflight(variable, false, err);
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
        let paramObj: any = {},
            targetObj: any = {};
        if (_.isObject(key)) {
            paramObj = key;
        } else {
            paramObj[key] = val;
        }

        if (!variable.filterExpressions) {
            variable.filterExpressions = {'condition': 'AND', 'rules': []};
        }
        targetObj = variable.filterExpressions;

        // find the existing criteria if present or else return null. Find the first one and return.
        // If the user wants to set a different object, then he has to use the getCriteria API defined
        // on the dataFilter object passed to the onBeforeListRecords
        function getExistingCriteria(filterField) {
            let existingCriteria = null;
            LiveVariableUtils.traverseFilterExpressions(targetObj, function (filterExpressions, criteria) {
                if (filterField === criteria.target) {
                    return existingCriteria = criteria;
                }
            });
            return existingCriteria;
        }

        _.forEach(paramObj, function (paramVal, paramKey) {
            const existingCriteria = getExistingCriteria(paramKey);
            if (existingCriteria !== null) {
                existingCriteria.value = paramVal;
            } else {
                targetObj.rules.push({
                    target: paramKey,
                    type: '',
                    matchMode: '',
                    value: paramVal,
                    required: false
                });
            }
        });

        return targetObj;
    }

    /**
     * Makes a file download call for a table
     * @param variable
     * @param options
     */
    public download(variable, options, successHandler, errorHandler) {
        options = options || {};
        let tableOptions;
        const data: any = {};
        const dbOperation = 'exportTableData';
        const projectID = $rootScope.project.id || $rootScope.projectName;
        options.data.searchWithQuery = true; // For export, query api is used. So set this flag to true
        options.data.skipEncode = true;
        tableOptions = LiveVariableUtils.prepareTableOptions(variable, options.data, undefined);
        data.query = tableOptions.query ? tableOptions.query : '';
        data.exportSize = options.data.exportSize;
        data.exportType = options.data.exportType;
        data.fields = formatExportExpression(options.data.fields);
        if (options.data.fileName) {
            data.fileName = options.data.fileName;
        }
        LVService[dbOperation]({
            'projectID': projectID,
            'service': variable.getPrefabName() ? '' : 'services',
            'dataModelName': variable.liveSource,
            'entityName': variable.type,
            'sort': tableOptions.sort,
            'url': variable.getPrefabName() ? ($rootScope.project.deployedUrl + '/prefabs/' + variable.getPrefabName()) : $rootScope.project.deployedUrl,
            'data': data,
            'filter': LiveVariableUtils.getWhereClauseGenerator(variable, options)
            // 'filterMeta'    : tableOptions.filter
        }).then(response => {
            window.location.href = response.body.result;
            triggerFn(successHandler, response);
        }, (response, xhrObj) => {
            initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, response, xhrObj);
            triggerFn(errorHandler, response);
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
        const projectID = $rootScope.project.id || $rootScope.projectName;
        const relatedTable = _.find(variable.relatedTables, table => table.relationName === columnName || table.columnName === columnName); // Comparing column name to support the old projects
        const selfRelatedCols = _.map(_.filter(variable.relatedTables, o => o.type === variable.type), 'relationName');
        const filterFields = [];
        let orderBy,
            filterOptions,
            query,
            action;
        _.forEach(options.filterFields, (value, key) => {
            value.fieldName = key;
            value.type = LiveVariableUtils.getFieldType(columnName, variable, key);
            /**
             * for 'in' mode we are taking the input as comma separated values and for between in ui there are two different fields
             * but these are processed and merged into a single value with comma as separator. For these conditions like 'in' and 'between',
             * for building the query, the function expects the values to be an array
             */
            if (value.filterCondition === DB_CONSTANTS.DATABASE_MATCH_MODES.in.toLowerCase() || value.filterCondition === DB_CONSTANTS.DATABASE_MATCH_MODES.between.toLowerCase()) {
                value.value = value.value.split(',');
            }
            filterFields.push(value);
        });
        filterOptions = LiveVariableUtils.getFilterOptions(variable, filterFields, options);
        query = LiveVariableUtils.getSearchQuery(filterOptions, ' ' + (options.logicalOp || 'AND') + ' ', variable.ignoreCase);
        if (options.filterExpr) {
            const _clonedFields = getClonedObject(_.isObject(options.filterExpr) ? options.filterExpr : JSON.parse(options.filterExpr));
            LiveVariableUtils.processFilterFields(_clonedFields.rules, variable, options);
            const filterExpQuery = LiveVariableUtils.generateSearchQuery(_clonedFields.rules, _clonedFields.condition, variable.ignoreCase, options.skipEncode);
            if (query !== '') {
                if (filterExpQuery !== '') {
                    query = '(' + query + ') AND (' + filterExpQuery + ')';
                }
            } else if (filterExpQuery !== '') {
                query = filterExpQuery;
            }
        }
        query = query ? ('q=' + query) : '';
        action = 'searchTableDataWithQuery';
        orderBy = _.isEmpty(options.orderBy) ? '' : 'sort=' + options.orderBy;
        return LVService[action]({
            projectID: projectID,
            service: variable.getPrefabName() ? '' : 'services',
            dataModelName: variable.liveSource,
            entityName: relatedTable.type,
            page: options.page || 1,
            size: options.pagesize || undefined,
            url: variable.getPrefabName() ? ($rootScope.project.deployedUrl + '/prefabs/' + variable.getPrefabName()) : $rootScope.project.deployedUrl,
            data: query || '',
            filter: LiveVariableUtils.getWhereClauseGenerator(variable, options),
            sort: orderBy
        }).then(res => {
            const response = res.body;
            /*Remove the self related columns from the data. As backend is restricting the self related column to one level, In liveform select, dataset and datavalue object
             * equality does not work. So, removing the self related columns to acheive the quality*/
            const data = _.map(response.content, o => _.omit(o, selfRelatedCols));

            const pagingOptions = Object.assign({}, response);
            delete pagingOptions.content;

            const result = {data: data, pagingOptions};
            triggerFn(success, result);

            return Promise.resolve(result);
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
        const projectID = $rootScope.project.id || $rootScope.projectName;
        const requestData: any = {};
        let sort;
        let tableOptions;
        options.skipEncode = true;
        options.operation = 'read';
        options = options || {};
        tableOptions = LiveVariableUtils.prepareTableOptions(variable, options);
        if (tableOptions.query) {
            requestData.filter = tableOptions.query;
        }
        requestData.groupByFields = _.isArray(options.fields) ? options.fields : [options.fields];
        sort = options.sort || requestData.groupByFields[0] + ' asc';
        sort = sort ? 'sort=' + sort : '';

        return LVService[dbOperation]({
            'projectID': projectID,
            'service': variable.getPrefabName() ? '' : 'services',
            'dataModelName': variable.liveSource,
            'entityName': options.entityName || variable.type,
            'page': options.page || 1,
            'size': options.pagesize,
            'sort': sort,
            'data': requestData,
            'url': variable.getPrefabName() ? ($rootScope.project.deployedUrl + '/prefabs/' + variable.getPrefabName()) : $rootScope.project.deployedUrl
        }).then(response => {
            if ((response && response.error) || !response) {
                triggerFn(error, response.error);
                return Promise.reject(response.error);
            }
            let result = response.body;
            const pagingOptions = Object.assign({}, response.body);
            delete pagingOptions.content;

            result = {data: result.content, pagingOptions};
            triggerFn(success, result);
            return Promise.resolve(result);
        }, errorMsg => {
            triggerFn(error, errorMsg);
            return Promise.reject(errorMsg);
        });
    }

    /*Function to get the aggregated data based on the fields chosen*/
    public getAggregatedData(variable, options, success, error) {
        const deployedURL = appManager.getDeployedURL();
        if (deployedURL) {
            return this.aggregateData(deployedURL, variable, options, success, error);
        }
    }

    public defineFirstLastRecord(variable) {
        if (variable.operation === 'read') {
            Object.defineProperty(variable, 'firstRecord', {
                'configurable': true,
                'get': () => {
                    return _.get(variable.dataSet, 'data[0]', {});
                }
            });
            Object.defineProperty(variable, 'lastRecord', {
                'configurable': true,
                'get': () => {
                    const data = _.get(variable.dataSet, 'data', []);
                    return data[data.length - 1];
                }
            });
        }
    }

    public getPrimaryKey(variable) {
        return LiveVariableUtils.getPrimaryKey(variable);
    }

    // Returns the search query params.
    public prepareRequestParams(options) {
        let requestParams;

        const searchKeys = _.split(options.searchKey, ','),
            formFields = {};

        _.forEach(searchKeys, (colName) => {
            formFields[colName] = {
                value: options.query,
                logicalOp: 'AND'
            };
        });

        requestParams = {
            filterFields: formFields,
            page: options.page,
            pagesize: options.limit || options.pagesize,
            skipDataSetUpdate: true, // dont update the actual variable dataset,
            skipToggleState: true, // Dont change the variable toggle state as this is a independent call
            inFlightBehavior: 'executeAll',
            logicalOp: 'OR',
            orderBy: options.orderby ? _.replace(options.orderby, /:/g, ' ') : ''
        };

        if (options.onBeforeservicecall) {
            options.onBeforeservicecall(formFields);
        }

        return requestParams;
    }

    /**
     * Gets the filtered records based on searchKey
     * @param variable
     * @param options contains the searchKey and queryText
     * @param success
     * @param error
     * @returns {Promise<any>}
     */
    public searchRecords(variable, options, success, error) {
        const requestParams = this.prepareRequestParams(options);

        return this.listRecords(variable, requestParams, success, error);
    }

    /**
     * used in onBeforeUpdate call - called last in the function - used in old Variables using dataBinding.
     * This function migrates the old data dataBinding to filterExpressions equivalent format
     * @param variable
     * @param inputData
     * @private
     */
    public upgradeInputDataToFilterExpressions(variable, response, inputData) {
        if (_.isObject(response)) {
            inputData = response;
            inputData.condition = 'AND';
            inputData.rules = [];
        }
        /**
         * if the user deletes a particular criteria, we need to remove this form our data aswell.
         * so we are keeping a copy of it and the emptying the existing object and now fill it with the
         * user set criteria. If its just modified, change the data and push it tohe rules or else just add a new criteria
         */
        const clonedRules = _.cloneDeep(inputData.rules);
        inputData.rules = [];
        _.forEach(inputData, function (valueObj, key) {
            if (key !== 'condition' && key !== 'rules') {
                const filteredObj = _.find(clonedRules, o => o.target === key);
                // if the key is found update the value, else create a new rule obj and add it to the existing rules
                if (filteredObj) {
                    filteredObj.value = valueObj.value;
                    filteredObj.matchMode = valueObj.matchMode || valueObj.filterCondition || filteredObj.matchMode || '';
                    inputData.rules.push(filteredObj);
                } else {
                    inputData.rules.push({
                        'target': key,
                        'type': '',
                        'matchMode': valueObj.matchMode || valueObj.filterCondition || '',
                        'value': valueObj.value,
                        'required': false
                    });
                }
                delete inputData[key];
            }
        });
        return inputData;
    }

    /**
     * used in onBeforeUpdate call - called first in the function - used in old Variables using dataBinding.
     * This function migrates the filterExpressions object to flat map structure
     * @param variable
     * @param inputData
     * @private
     */
    public downgradeFilterExpressionsToInputData(variable, inputData) {
        if (inputData.hasOwnProperty('getFilterFields')) {
            inputData = inputData.getFilterFields();
        }
        _.forEach(inputData.rules, function (ruleObj) {
            if (!_.isNil(ruleObj.target) && ruleObj.target !== '') {
                inputData[ruleObj.target] = {
                    'value': ruleObj.value,
                    'matchMode': ruleObj.matchMode
                };
            }
        });
        return inputData;
    }
}