import { formatDate, getClonedObject, isDateTimeType, isNumberType, replace, triggerFn } from '@wm/core';
import { $rootScope, DB_CONSTANTS, SWAGGER_CONSTANTS, VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import * as LVService from './live-variable.http.utils';
import { getEvaluatedOrderBy, initiateCallback } from './variables.utils';
import { $queue } from '../inflight-queue';

declare const _, window;

const _initiateCallback = initiateCallback;

export default class LiveVariableUtils {

    static isCompositeKey = (primaryKey) => {
        return !primaryKey || (primaryKey && (!primaryKey.length || primaryKey.length > 1));
    }

    static isNoPrimaryKey = (primaryKey) => {
        return (!primaryKey || (primaryKey && !primaryKey.length));
    }

    // Generate the URL based on the primary keys and their values
    static getCompositeIDURL = (primaryKeysData) => {
        let compositeId = '';
        //  Loop over the 'compositeKeysData' and construct the 'compositeId'.
        _.forEach(primaryKeysData, function (paramValue, paramName) {
            compositeId += paramName + '=' + encodeURIComponent(paramValue) + '&';
        });
        compositeId = compositeId.slice(0, -1);
        return compositeId;
    }


    // Check if table has blob column
    static hasBlob = (variable) => {
        return _.find(_.get(variable, ['propertiesMap', 'columns']), {'type': 'blob'});
    }

    static getPrimaryKey = (variable) => {
        if (!variable.propertiesMap) {
            return [];
        }

        if (variable.propertiesMap.primaryFields) {
            return variable.propertiesMap.primaryFields;
        }
        /*Old projects do not have primary fields. Get primary key from the columns*/
        const primaryKey = [];
        /*Loop through the propertiesMap and get the primary key column.*/
        _.forEach(variable.propertiesMap.columns, function (index, column) {
            if (column.isPrimaryKey) {
                if (column.isRelated && (!_.includes(column.relatedFieldName, primaryKey))) {
                    primaryKey.push(column.relatedFieldName);
                } else if (!_.includes(column.fieldName, primaryKey)) {
                    primaryKey.push(column.fieldName);
                }
            }
        });
        return primaryKey;
    }

    //  Construct the URL for blob columns and set it in the data, so that widgets can use this
    static processBlobColumns = (responseData, variable) => {
        if (!responseData) {
            return;
        }
        const blobCols = _.map(_.filter(variable.propertiesMap.columns, {'type': 'blob'}), 'fieldName'),
            deployedUrl = _.trim($rootScope.project.deployedUrl);
        let href = '',
            primaryKeys;

        if (_.isEmpty(blobCols)) {
            return;
        }
        // if (CONSTANTS.hasCordova && isRunMode) {
        //     href += _.endsWith(deployedUrl, '/') ? deployedUrl : deployedUrl + '/';
        // }
        href += ((variable._prefabName !== '' && variable._prefabName !== undefined) ? 'prefabs/' + variable._prefabName : 'services') + '/' + variable.liveSource + '/' + variable.type + '/';
        primaryKeys = variable.propertiesMap.primaryFields || variable.propertiesMap.primaryKeys;
        _.forEach(responseData, function (data) {
            if (data) {
                _.forEach(blobCols, function (col) {
                    const compositeKeysData = {};
                    if (data[col] === null || !_.isEmpty(_.trim(data[col]))) {
                        return;
                    }
                    if (LiveVariableUtils.isCompositeKey(primaryKeys)) {
                        primaryKeys.forEach(function (key) {
                            compositeKeysData[key] = data[key];
                        });
                        data[col] = href + 'composite-id/content/' + col + '?' + LiveVariableUtils.getCompositeIDURL(compositeKeysData);
                    } else {
                        data[col] = href + data[_.join(primaryKeys)] + '/content/' + col;
                    }
                });
            }
        });
    }

    static getHibernateOrSqlType = (variable, fieldName, type) => {
        const columns = variable.propertiesMap.columns;
        let column,
            relatedCols,
            relatedCol;
        if (_.includes(fieldName, '.')) {
            column = _.find(columns, function (col) {
                return col.fieldName === fieldName.split('.')[0];
            });
            relatedCols = column && column.columns;
            relatedCol = _.find(relatedCols, function (col) {
                return col.fieldName === fieldName.split('.')[1];
            });
            return relatedCol && relatedCol[type];
        }
        column = _.find(columns, function (col) {
            return col.fieldName === fieldName || col.relatedColumnName === fieldName;
        });
        return column && column[type];
    }

    /*Function to get the sqlType of the specified field.*/
    static getSqlType = (variable, fieldName) => {
        return LiveVariableUtils.getHibernateOrSqlType(variable, fieldName, 'type');
    }

    /*Function to check if the specified field has a one-to-many relation or not.*/
    static isRelatedFieldMany = (variable, fieldName) => {
        const columns = variable.propertiesMap.columns,
            columnsCount = columns.length;
        let index,
            column;
        /*Loop through the columns of the liveVariable*/
        for (index = 0; index < columnsCount; index += 1) {
            column = columns[index];
            /*If the specified field is found in the columns of the variable,
            * then it has a many-to-one relation.*/
            if (column.fieldName === fieldName) {
                return false;
            }
        }
        return true;
    }

    static isStringType = (type) => {
        return _.includes(['text', 'string'], _.toLower(type));
    }

    static getSQLFieldType = (variable, options) => {
        if (_.includes(['timestamp', 'datetime', 'date'], options.type)) {
            return options.type;
        }
        return LiveVariableUtils.getSqlType(variable, options.fieldName) || options.type;
    }

    static getAttributeName = (variable, fieldName) => {
        let attrName = fieldName;
        variable.propertiesMap.columns.forEach(function (column) {
            if (column.fieldName === fieldName && column.isRelated) {
                attrName = column.relatedFieldName;
            }
        });
        return attrName;
    }

    static getFilterCondition = (filterCondition) => {
        if (_.includes(DB_CONSTANTS.DATABASE_RANGE_MATCH_MODES, filterCondition)) {
            return filterCondition;
        }
        return DB_CONSTANTS.DATABASE_MATCH_MODES['exact'];
    }

    static getFilterOptions = (variable, filterFields, options) => {
        const filterOptions = [],
            matchModes = DB_CONSTANTS.DATABASE_MATCH_MODES;
        _.each(filterFields, function (fieldOptions) {
            const fieldName = fieldOptions.fieldName,
                fieldType = LiveVariableUtils.getSQLFieldType(variable, fieldOptions);
            let attributeName,
                fieldValue = fieldOptions.value,
                filterCondition = fieldOptions.filterCondition,
                filterOption;

            fieldOptions.type = fieldType;
            /* if the field value is an object(complex type), loop over each field inside and push only first level fields */
            if (_.isObject(fieldValue) && !_.isArray(fieldValue)) {
                _.forEach(fieldValue, function (subFieldValue, subFieldName) {
                    if (subFieldValue && !_.isObject(subFieldValue)) {
                        filterOptions.push(fieldName + '.' + subFieldName + '=' + subFieldValue);
                    }
                });
            } else if (!_.isUndefined(fieldValue) && fieldValue !== null && fieldValue !== '') {
                /*Based on the sqlType of the field, format the value & set the filter condition.*/
                if (fieldType) {
                    switch (fieldType) {
                        case 'integer':
                            fieldValue = _.isArray(fieldValue) ? _.map(fieldValue, function (value) {
                                return parseInt(value, 10);
                            }) : parseInt(fieldValue, 10);
                            filterCondition = filterCondition ? LiveVariableUtils.getFilterCondition(filterCondition) : matchModes['exact'];
                            break;
                        case 'date':
                        case 'datetime':
                        case 'timestamp':
                            fieldValue = formatDate(fieldValue, fieldType);
                            filterCondition = filterCondition ? LiveVariableUtils.getFilterCondition(filterCondition) : matchModes['exact'];
                            break;
                        case 'text':
                        case 'string':
                            if (_.isArray(fieldValue)) {
                                filterCondition = matchModes['exact'];
                            } else {
                                filterCondition = filterCondition || matchModes['anywhere'];
                            }
                            break;
                        default:
                            filterCondition = filterCondition ? LiveVariableUtils.getFilterCondition(filterCondition) : matchModes['exact'];
                            break;
                    }
                } else {
                    filterCondition = _.isString(fieldValue) ? matchModes['anywhere'] : matchModes['exact'];
                }
                attributeName = LiveVariableUtils.getAttributeName(variable, fieldName);
                filterOption = {
                    'attributeName': attributeName,
                    'attributeValue': fieldValue,
                    'attributeType': _.toUpper(fieldType),
                    'filterCondition': filterCondition
                };
                if (options.searchWithQuery) {
                    filterOption.isVariableFilter = fieldOptions.isVariableFilter;
                }
                filterOptions.push(filterOption);
            } else if (_.includes(DB_CONSTANTS.DATABASE_EMPTY_MATCH_MODES, filterCondition)) {
                attributeName = LiveVariableUtils.getAttributeName(variable, fieldName);
                // For non string types empty match modes are not supported, so convert them to null match modes.
                if (fieldType && !LiveVariableUtils.isStringType(fieldType)) {
                    filterCondition = DB_CONSTANTS.DATABASE_NULL_EMPTY_MATCH[filterCondition];
                }
                filterOption = {
                    'attributeName': attributeName,
                    'attributeValue': '',
                    'attributeType': _.toUpper(fieldType),
                    'filterCondition': filterCondition
                };
                if (options.searchWithQuery) {
                    filterOption.isVariableFilter = fieldOptions.isVariableFilter;
                }
                filterOptions.push(filterOption);
            }
        });
        return filterOptions;
    }

    // Wrap the field name and value in lower() in ignore case scenario
    // TODO: Change the function name to represent the added functionality of identifiers for datetime, timestamp and float types. Previously only lower was warapped.
    static wrapInLowerCase = (value, options, ignoreCase, isField?) => {
        const type = _.toLower(options.attributeType);
        if (!isField) {
            // Wrap the identifiers for datetime, timestamp and float types. Wrappring is not required for fields.
            if (type === 'datetime') {
                return 'wm_dt(' + value + ')';
            }
            if (type === 'timestamp') {
                return 'wm_ts(' + value + ')';
            }
            if (type === 'float') {
                return 'wm_float(' + value + ')';
            }
            if (type === 'boolean') {
                return 'wm_bool(' + value + ')';
            }
        }
        // If ignore case is true and type is string/ text and match mode is string type, wrap in lower()
        if (ignoreCase && (!type || LiveVariableUtils.isStringType(type)) && _.includes(DB_CONSTANTS.DATABASE_STRING_MODES, options.filterCondition)) {
            return 'lower(' + value + ')';
        }
        return value;
    }

    static encodeAndAddQuotes = (value, type, skipEncode) => {
        let encodedValue = skipEncode ? value : encodeURIComponent(value);
        type = _.toLower(type);
        encodedValue = _.replace(encodedValue, /'/g, '\'\'');
        // For number types, don't wrap the value in quotes
        if ((isNumberType(type) && type !== 'float')) {
            return encodedValue;
        }
        return '\'' + encodedValue + '\'';
    }

    static getParamValue = (value, options, ignoreCase, skipEncode) => {
        let param;
        const filterCondition = options.filterCondition,
            dbModes = DB_CONSTANTS.DATABASE_MATCH_MODES,
            type = options.attributeType;
        if (_.includes(DB_CONSTANTS.DATABASE_EMPTY_MATCH_MODES, filterCondition)) {
            // For empty matchmodes, no value is required
            return '';
        }
        switch (filterCondition) {
            case dbModes.start:
                param = LiveVariableUtils.encodeAndAddQuotes(value + '%', type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
            case dbModes.end:
                param = LiveVariableUtils.encodeAndAddQuotes('%' + value, type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
            case dbModes.anywhere:
                param = LiveVariableUtils.encodeAndAddQuotes('%' + value + '%', type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
            case dbModes.exact:
            case dbModes.notequals:
                param = LiveVariableUtils.encodeAndAddQuotes(value, type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
            case dbModes.between:
                param = _.join(_.map(value, function (val) {
                    return LiveVariableUtils.wrapInLowerCase(LiveVariableUtils.encodeAndAddQuotes(val, type, skipEncode), options, ignoreCase);
                }), ' and ');
                break;
            case dbModes.in:
                param = _.join(_.map(value, function (val) {
                    return LiveVariableUtils.wrapInLowerCase(LiveVariableUtils.encodeAndAddQuotes(val, type, skipEncode), options, ignoreCase);
                }), ', ');
                param = '(' + param + ')';
                break;
            default:
                param = LiveVariableUtils.encodeAndAddQuotes(value, type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
        }
        return !_.isUndefined(param) ? param : '';
    }

    static getSearchQuery = (filterOptions, operator, ignoreCase, skipEncode?) => {
        let query;
        const params = [];
        _.forEach(filterOptions, function (fieldValue) {
            const value = fieldValue.attributeValue,
                dbModes = DB_CONSTANTS.DATABASE_MATCH_MODES,
                isValArray = _.isArray(value);
            let fieldName = fieldValue.attributeName,
                filterCondition = fieldValue.filterCondition,
                matchModeExpr,
                paramValue;
            // If value is an empty array, do not generate the query
            // If values is NaN and number type, do not generate query for this field
            if ((isValArray && _.isEmpty(value)) || (!isValArray && isNaN(value) && isNumberType(fieldValue.attributeType))) {
                return;
            }
            if (isValArray) {
                // If array is value and mode is between, pass between. Else pass as in query
                filterCondition = filterCondition === dbModes.between ? filterCondition : dbModes.in;
                fieldValue.filterCondition = filterCondition;
            }
            matchModeExpr = DB_CONSTANTS.DATABASE_MATCH_MODES_WITH_QUERY[filterCondition];
            paramValue = LiveVariableUtils.getParamValue(value, fieldValue, ignoreCase, skipEncode);
            fieldName = LiveVariableUtils.wrapInLowerCase(fieldName, fieldValue, ignoreCase, true);
            params.push(replace(matchModeExpr, [fieldName, paramValue]));
        });
        query = _.join(params, operator); // empty space added intentionally around OR
        return query;
    }

    static prepareTableOptions = (variable, options, clonedFields?) => {
        if (_.isUndefined(options.searchWithQuery)) {
            options.searchWithQuery = true; //  Using query api instead of  search api
        }
        const filterFields = [];
        let filterOptions = [],
            orderByFields,
            orderByOptions,
            query,
            optionsQuery;
        clonedFields = clonedFields || variable.filterFields;
        // get the filter fields from the variable
        _.forEach(clonedFields, function (value, key) {
            if (!options.filterFields || !options.filterFields[key] || options.filterFields[key].logicalOp === 'AND') {
                value.fieldName = key;
                if (LiveVariableUtils.isStringType(LiveVariableUtils.getSQLFieldType(variable, value))) {
                    value.filterCondition = DB_CONSTANTS.DATABASE_MATCH_MODES[value.matchMode || variable.matchMode];
                }
                value.isVariableFilter = true;
                filterFields.push(value);
            }
        });
        // get the filter fields from the options
        _.forEach(options.filterFields, function (value, key) {
            value.fieldName = key;
            value.filterCondition = DB_CONSTANTS.DATABASE_MATCH_MODES[value.matchMode || options.matchMode || variable.matchMode];
            filterFields.push(value);
        });
        if (variable.operation === 'read' || options.operation === 'read') {
            filterOptions = LiveVariableUtils.getFilterOptions(variable, filterFields, options);
        }
        /*if searchWithQuery is true, then convert the input params into query string. For example if firstName and lastName
         should be sent as params then query string will be q='firstName containing 'someValue' OR lastName containing 'someValue''
         */
        if (options.searchWithQuery && filterOptions.length) {
            // Generate query for variable filter fields. This has AND logical operator
            query = LiveVariableUtils.getSearchQuery(_.filter(filterOptions, {'isVariableFilter': true}), ' AND ', variable.ignoreCase, options.skipEncode);
            // Generate query for option filter fields. This has default logical operator as OR
            optionsQuery = LiveVariableUtils.getSearchQuery(_.filter(filterOptions, {'isVariableFilter': undefined}), ' ' + (options.logicalOp || 'AND') + ' ', variable.ignoreCase, options.skipEncode);
            if (optionsQuery) {
                // If both variable and option query are present, merge them with AND
                query = query ? (query + ' AND ( ' + optionsQuery + ' )') : optionsQuery;
            }
        }
        orderByFields = getEvaluatedOrderBy(variable.orderBy, options.orderBy);
        orderByOptions = orderByFields ? 'sort=' + orderByFields : '';

        return {
            'filter': filterOptions,
            'sort': orderByOptions,
            'query': query
        };
    }

    /* Function to check if specified field is of type date*/
    static getFieldType = (fieldName, variable, relatedField?) => {
        let fieldType,
            columns,
            result;
        if (variable.propertiesMap) {
            columns = variable.propertiesMap.columns || [];
            result = _.find(columns, function (obj) {
                return obj.fieldName === fieldName;
            });
            // if related field name passed, get its type from columns inside the current field
            if (relatedField && result) {
                result = _.find(result.columns, function (obj) {
                    return obj.fieldName === relatedField;
                });
            }
            fieldType = result && result.type;
        }
        return fieldType;
    }

    // Prepare formData for blob columns
    static prepareFormData = (variableDetails, rowObject) => {
        const formData: any = new FormData();
        formData.rowData = _.clone(rowObject);
        _.forEach(rowObject, function (colValue, colName) {
            if (LiveVariableUtils.getFieldType(colName, variableDetails) === 'blob') {
                if (_.isObject(colValue)) {
                    if (_.isArray(colValue)) {
                        _.forEach(colValue, function (fileObject) {
                            formData.append(colName, fileObject, fileObject.name);
                        });
                    } else {
                        formData.append(colName, colValue, colValue.name);
                    }
                }
                rowObject[colName] = colValue !== null ? '' : null;
            }
        });
        formData.append(SWAGGER_CONSTANTS.WM_DATA_JSON, new Blob([JSON.stringify(rowObject)], {
            type: 'application/json'
        }));
        return formData;
    }

    static doCUD = (action, variable, options, success, error) => {
        const projectID = $rootScope.project.id || $rootScope.projectName,
            primaryKey = LiveVariableUtils.getPrimaryKey(variable),
            isFormDataSupported = (window.File && window.FileReader && window.FileList && window.Blob);

        let dbName,
            compositeId = '',
            rowObject = {},
            prevData,
            promiseObj,
            compositeKeysData = {},
            prevCompositeKeysData = {},
            id,
            columnName,
            clonedFields,
            output,
            inputFields = options.inputFields || variable.inputFields;

        // EVENT: ON_BEFORE_UPDATE
        clonedFields = getClonedObject(inputFields);
        output = _initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE, variable, clonedFields);
        if (output === false) {
            // $rootScope.$emit('toggle-variable-state', variable, false);
            triggerFn(error);
            return Promise.reject('Call stopped from the event: ' + VARIABLE_CONSTANTS.EVENT.BEFORE_UPDATE);
        }
        inputFields = _.isObject(output) ? output : clonedFields;
        variable.canUpdate = false;

        if (options.row) {
            rowObject = options.row;
            // For datetime types, convert the value to the format accepted by backend
            _.forEach(rowObject, function (value, key) {
                const fieldType = LiveVariableUtils.getFieldType(key, variable);
                let fieldValue;
                if (isDateTimeType(fieldType)) {
                    fieldValue = formatDate(value, fieldType);
                    rowObject[key] = fieldValue;
                } else if (_.isArray(value) && LiveVariableUtils.isStringType(fieldType)) {
                    // Construct ',' separated string if param is not array type but value is an array
                    fieldValue = _.join(value, ',');
                    rowObject[key] = fieldValue;
                }
            });
            // Merge inputFields along with dataObj while making Insert/Update/Delete
            _.forEach(inputFields, function (attrValue, attrName) {
                if (attrValue && !rowObject[attrName]) {
                    rowObject[attrName] = attrValue;
                }
            });
        } else {
            _.forEach(inputFields, function (fieldValue, fieldName) {
                let fieldType;
                const primaryKeys = variable.propertiesMap.primaryFields || variable.propertiesMap.primaryKeys;
                if (!_.isUndefined(fieldValue) && fieldValue !== '') {
                    /*For delete action, the inputFields need to be set in the request URL. Hence compositeId is set.
                     * For insert action inputFields need to be set in the request data. Hence rowObject is set.
                     * For update action, both need to be set.*/
                    if (action === 'deleteTableData') {
                        compositeId = fieldValue;
                    }
                    if (action === 'updateTableData') {
                        primaryKeys.forEach(function (key) {
                            if (fieldName === key) {
                                compositeId = fieldValue;
                            }
                        });
                    }
                    if (action !== 'deleteTableData' || LiveVariableUtils.isCompositeKey(primaryKey)) {
                        fieldType = LiveVariableUtils.getFieldType(fieldName, variable);
                        if (isDateTimeType(fieldType)) {
                            fieldValue = formatDate(fieldValue, fieldType);
                        } else if (_.isArray(fieldValue) && LiveVariableUtils.isStringType(fieldType)) {
                            // Construct ',' separated string if param is not array type but value is an array
                            fieldValue = _.join(fieldValue, ',');
                        }
                        rowObject[fieldName] = fieldValue;
                    }
                    // for related entities, clear the blob type fields
                    if (_.isObject(fieldValue) && !_.isArray(fieldValue)) {
                        _.forEach(fieldValue, function (val, key) {
                            if (LiveVariableUtils.getFieldType(fieldName, variable, key) === 'blob') {
                                fieldValue[key] = val === null ? val : '';
                            }
                        });
                    }
                }
            });
        }

        switch (action) {
            case 'updateTableData':
                prevData = options.prevData || {};
                /*Construct the "requestData" based on whether the table associated with the live-variable has a composite key or not.*/
                if (LiveVariableUtils.isCompositeKey(primaryKey)) {
                    if (LiveVariableUtils.isNoPrimaryKey(primaryKey)) {
                        prevCompositeKeysData = prevData || options.rowData || rowObject;
                        compositeKeysData = rowObject;
                    } else {
                        primaryKey.forEach(function (key) {
                            compositeKeysData[key] = rowObject[key];
                            prevCompositeKeysData[key] = prevData[key] || (options.rowData && options.rowData[key]) || rowObject[key];
                        });
                    }
                    options.row = compositeKeysData;
                    options.compositeKeysData = prevCompositeKeysData;
                } else {
                    primaryKey.forEach(function (key) {
                        if (key.indexOf('.') === -1) {
                            id = prevData[key] || (options.rowData && options.rowData[key]) || rowObject[key];
                        } else {
                            columnName = key.split('.');
                            id = prevData[columnName[0]][columnName[1]];
                        }
                    });
                    options.id = id;
                    options.row = rowObject;
                }

                break;
            case 'deleteTableData':
                /*Construct the "requestData" based on whether the table associated with the live-variable has a composite key or not.*/
                if (LiveVariableUtils.isCompositeKey(primaryKey)) {
                    if (LiveVariableUtils.isNoPrimaryKey(primaryKey)) {
                        compositeKeysData = rowObject;
                    } else {
                        primaryKey.forEach(function (key) {
                            compositeKeysData[key] = rowObject[key];
                        });
                    }
                    options.compositeKeysData = compositeKeysData;
                } else if (!_.isEmpty(rowObject)) {
                    primaryKey.forEach(function (key) {
                        if (key.indexOf('.') === -1) {
                            id = rowObject[key];
                        } else {
                            columnName = key.split('.');
                            id = rowObject[columnName[0]][columnName[1]];
                        }
                    });
                    options.id = id;
                }
                break;
            default:
                break;
        }
        // If table has blob column then send multipart data
        if ((action === 'updateTableData' || action === 'insertTableData') && LiveVariableUtils.hasBlob(variable) && isFormDataSupported) {
            if (action === 'updateTableData') {
                action = 'updateMultiPartTableData';
            } else {
                action = 'insertMultiPartTableData';
            }
            rowObject = LiveVariableUtils.prepareFormData(variable, rowObject);
        }
        /*Check if "options" have the "compositeKeysData" property.*/
        if (options.compositeKeysData) {
            switch (action) {
                case 'updateTableData':
                    action = 'updateCompositeTableData';
                    break;
                case 'deleteTableData':
                    action = 'deleteCompositeTableData';
                    break;
                case 'updateMultiPartTableData':
                    action = 'updateMultiPartCompositeTableData';
                    break;
                default:
                    break;
            }
            compositeId = LiveVariableUtils.getCompositeIDURL(options.compositeKeysData);
        }
        dbName = variable.liveSource;

        /*Set the "data" in the request to "undefined" if there is no data.
        * This handles cases such as "Delete" requests where data should not be passed.*/
        if (_.isEmpty(rowObject) && action === 'deleteTableData') {
            rowObject = undefined;
        }

        promiseObj = LVService[action]({
            'projectID': projectID,
            'service': variable._prefabName ? '' : 'services',
            'dataModelName': dbName,
            'entityName': variable.type,
            'id': !_.isUndefined(options.id) ? encodeURIComponent(options.id) : compositeId,
            'data': rowObject,
            'url': variable._prefabName ? ($rootScope.project.deployedUrl + '/prefabs/' + variable._prefabName) : $rootScope.project.deployedUrl
        }).then(function (response, xhrObj) {
            response = response.body;
            $queue.process(variable);
            /* if error received on making call, call error callback */
            if (response && response.error) {
                // EVENT: ON_RESULT
                _initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, response);
                // EVENT: ON_ERROR
                _initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, response.error);
                // EVENT: ON_CAN_UPDATE
                variable.canUpdate = true;
                _initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, response.error);
                triggerFn(error, response.error);
                return Promise.reject(response.error);
            }

            // EVENT: ON_RESULT
            _initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, response);
            if (variable.operation !== 'read') {
                // EVENT: ON_PREPARESETDATA
                const newDataSet = _initiateCallback(VARIABLE_CONSTANTS.EVENT.PREPARE_SETDATA, variable, response);
                if (newDataSet) {
                    // setting newDataSet as the response to service variable onPrepareSetData
                    response = newDataSet;
                }
                variable.dataSet = response;
            }
            // EVENT: ON_SUCCESS
            _initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, response);
            // EVENT: ON_CAN_UPDATE
            variable.canUpdate = true;
            _initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, response);
            triggerFn(success, response);
            return Promise.resolve(response);
        }, function (response, details, xhrObj) {
            // EVENT: ON_RESULT
            _initiateCallback(VARIABLE_CONSTANTS.EVENT.RESULT, variable, response);
            // EVENT: ON_ERROR
            if (!options.skipNotification) {
                _initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, response);
            }
            // EVENT: ON_CAN_UPDATE
            variable.canUpdate = true;
            _initiateCallback(VARIABLE_CONSTANTS.EVENT.CAN_UPDATE, variable, response);
            triggerFn(error, response);
            return Promise.reject(response);
        });

        return variable.promise = promiseObj;
    }
}

