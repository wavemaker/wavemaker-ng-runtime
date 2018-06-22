import { formatDate, getClonedObject, isDateTimeType, isDefined, isNumberType, replace, triggerFn } from '@wm/core';
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
        _.forEach(primaryKeysData, (paramValue, paramName) => {
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
        _.forEach(variable.propertiesMap.columns, (index, column) => {
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
        _.forEach(responseData, data => {
            if (data) {
                _.forEach(blobCols, col => {
                    const compositeKeysData = {};
                    if (data[col] === null || !_.isEmpty(_.trim(data[col]))) {
                        return;
                    }
                    if (LiveVariableUtils.isCompositeKey(primaryKeys)) {
                        primaryKeys.forEach(key => {
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
            column = _.find(columns, col => {
                return col.fieldName === fieldName.split('.')[0];
            });
            relatedCols = column && column.columns;
            relatedCol = _.find(relatedCols, col => {
                return col.fieldName === fieldName.split('.')[1];
            });
            return relatedCol && relatedCol[type];
        }
        column = _.find(columns, col => {
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
        variable.propertiesMap.columns.forEach(column => {
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

    static getFilterOption = (variable, fieldOptions, options) => {
        let attributeName,
            fieldValue = fieldOptions.value,
            filterOption,
            filterCondition;

        const matchModes = DB_CONSTANTS.DATABASE_MATCH_MODES,
            fieldName = fieldOptions.fieldName,
            fieldRequired = fieldOptions.required || false,
            fieldType = LiveVariableUtils.getSQLFieldType(variable, fieldOptions);

        filterCondition = matchModes[fieldOptions.matchMode] || matchModes[fieldOptions.filterCondition] || fieldOptions.filterCondition;

            fieldOptions.type = fieldType;
        /* if the field value is an object(complex type), loop over each field inside and push only first level fields */
        if (_.isObject(fieldValue) && !_.isArray(fieldValue)) {
            const firstLevelValues = [];
            _.forEach(fieldValue, (subFieldValue, subFieldName) => {
                if (subFieldValue && !_.isObject(subFieldValue)) {
                    firstLevelValues.push(fieldName + '.' + subFieldName + '=' + subFieldValue);
                }
            });
            return firstLevelValues;
        }

        if (_.includes(DB_CONSTANTS.DATABASE_EMPTY_MATCH_MODES, filterCondition)) {
            attributeName = LiveVariableUtils.getAttributeName(variable, fieldName);
            // For non string types empty match modes are not supported, so convert them to null match modes.
            if (fieldType && !LiveVariableUtils.isStringType(fieldType)) {
                filterCondition = DB_CONSTANTS.DATABASE_NULL_EMPTY_MATCH[filterCondition];
            }
            filterOption = {
                'attributeName': attributeName,
                'attributeValue': '',
                'attributeType': _.toUpper(fieldType),
                'filterCondition': filterCondition,
                'required': fieldRequired
            };
            if (options.searchWithQuery) {
                filterOption.isVariableFilter = fieldOptions.isVariableFilter;
            }
            return filterOption;
        }

        if (isDefined(fieldValue) && fieldValue !== null && fieldValue !== '') {
            /*Based on the sqlType of the field, format the value & set the filter condition.*/
            if (fieldType) {
                switch (fieldType) {
                    case 'integer':
                        fieldValue = _.isArray(fieldValue) ? _.reduce(fieldValue, (result, value) => {
                            value = parseInt(value, 10);
                            if (!_.isNaN(value)) {
                                result.push(value);
                            }
                            return result;
                        }, []) : parseInt(fieldValue, 10);
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
                            filterCondition = filterCondition || matchModes['anywhereignorecase'];
                        }
                        break;
                    default:
                        filterCondition = filterCondition ? LiveVariableUtils.getFilterCondition(filterCondition) : matchModes['exact'];
                        break;
                }
            } else {
                filterCondition = _.isString(fieldValue) ? matchModes['anywhereignorecase'] : matchModes['exact'];
            }
            attributeName = LiveVariableUtils.getAttributeName(variable, fieldName);
            filterOption = {
                'attributeName': attributeName,
                'attributeValue': fieldValue,
                'attributeType': _.toUpper(fieldType),
                'filterCondition': filterCondition,
                'required': fieldRequired
            };
            if (options.searchWithQuery) {
                filterOption.isVariableFilter = fieldOptions.isVariableFilter;
            }
            return filterOption;
        }
    }

    static getFilterOptions = (variable, filterFields, options) => {
        const filterOptions = [];
        _.each(filterFields, (fieldOptions) => {
            const filterOption = LiveVariableUtils.getFilterOption(variable, fieldOptions, options);
            if (!_.isNil(filterOption)) {
                if (_.isArray(filterOption)) {
                    filterOptions.concat(filterOption);
                } else {
                    filterOptions.push(filterOption);
                }
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
            case dbModes.startignorecase:
            case dbModes.start:
                param = LiveVariableUtils.encodeAndAddQuotes(value + '%', type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
            case dbModes.endignorecase:
            case dbModes.end:
                param = LiveVariableUtils.encodeAndAddQuotes('%' + value, type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
            case dbModes.anywhereignorecase:
            case dbModes.anywhere:
                param = LiveVariableUtils.encodeAndAddQuotes('%' + value + '%', type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
            case dbModes.exactignorecase:
            case dbModes.exact:
            case dbModes.notequals:
                param = LiveVariableUtils.encodeAndAddQuotes(value, type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
            case dbModes.between:
                param = _.join(_.map(value, val => {
                    return LiveVariableUtils.wrapInLowerCase(LiveVariableUtils.encodeAndAddQuotes(val, type, skipEncode), options, ignoreCase);
                }), ' and ');
                break;
            case dbModes.in:
                param = _.join(_.map(value, val => {
                    return LiveVariableUtils.wrapInLowerCase(LiveVariableUtils.encodeAndAddQuotes(val, type, skipEncode), options, ignoreCase);
                }), ', ');
                param = '(' + param + ')';
                break;
            default:
                param = LiveVariableUtils.encodeAndAddQuotes(value, type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
        }
        return isDefined(param) ? param : '';
    }

    static getSearchQuery = (filterOptions, operator, ignoreCase, skipEncode?) => {
        let query;
        const params = [];
        _.forEach(filterOptions, fieldValue => {
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

    /**
     * creating the proper values from the actual object like for between,in matchModes value has to be an array like [1,2]
     * @param rules recursive filterexpressions object
     * @param variable variable object
     * @param options options
     */
    static processFilterFields = (rules, variable, options) => {
        _.remove(rules, rule => {
            return rule && (_.isString(rule.value) && rule.value.indexOf('bind:') === 0 || (rule.matchMode === 'between' ? (_.isString(rule.secondvalue) && rule.secondvalue.indexOf("bind:") === 0) : false));
        });

        _.forEach(rules, (rule, index) => {
            if (rule) {
                if (rule.rules) {
                    LiveVariableUtils.processFilterFields(rule.rules, variable, options);
                } else {
                    if (!_.isNull(rule.target)) {
                        const value = rule.matchMode.toLowerCase() === DB_CONSTANTS.DATABASE_MATCH_MODES.between.toLowerCase()
                            ? [rule.value, rule.secondvalue]
                            : (rule.matchMode.toLowerCase() === DB_CONSTANTS.DATABASE_MATCH_MODES.in.toLowerCase()
                                ? (_.isArray(rule.value) ? rule.value : (rule.value ? rule.value.split(',') : ''))
                                : rule.value);
                        rules[index] = LiveVariableUtils.getFilterOption(variable, {
                            'fieldName': rule.target,
                            'type': rule.type,
                            'value': value,
                            'required': rule.required,
                            'filterCondition': rule.matchMode || options.matchMode || variable.matchMode
                        }, options);
                    }
                }
            }
        });
    }

    static getSearchField = (fieldValue, ignoreCase, skipEncode) => {
        let fieldName = fieldValue.attributeName;
        let matchModeExpr;
        let paramValue;
        let filterCondition = fieldValue.filterCondition;

        const value = fieldValue.attributeValue;
        const isValArray = _.isArray(value);
        const dbModes = DB_CONSTANTS.DATABASE_MATCH_MODES;

        // If value is an empty array, do not generate the query
        // If values is NaN and number type, do not generate query for this field
        if ((isValArray && _.isEmpty(value)) || (isValArray && _.some(value, val => {return (_.isNull(val) || _.isNaN(val) || val === "")})) || (!isValArray && isNaN(value) && isNumberType(fieldValue.attributeType))) {
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
        return replace(matchModeExpr, [fieldName, paramValue]);
    }

    /**
     * this is used to identify whether to use ignorecase at each criteria level and not use the variable
     * level isIgnoreCase flag and apply it to all the rules.
     * Instead of adding an extra param to the criteria object, we have added few other matchmodes for string types like
     * anywhere with anywhereignorecase, start with startignorecase, end with endignorecase, exact with exactignorecase,
     * So while creating the criteria itseld user can choose whether to use ignore case or not for a particular column while querying
     * @param matchMode
     * @param ignoreCase
     * @returns {*} boolean
     */
    static getIgnoreCase = (matchMode, ignoreCase) => {
        const matchModes = DB_CONSTANTS.DATABASE_MATCH_MODES;
        if (_.indexOf([matchModes['anywhere'], matchModes['start'], matchModes['end'], matchModes['exact']], matchMode) !== -1) {
            return false;
        }
        if (_.indexOf([matchModes['anywhereignorecase'], matchModes['startignorecase'], matchModes['endignorecase'], matchModes['exactignorecase']], matchMode) !== -1) {
            return true;
        }
        return ignoreCase;
    }

    static generateSearchQuery = (rules, condition, ignoreCase, skipEncode) => {
        const params = [];
        _.forEach(rules, rule => {
            if (rule) {
                if (rule.rules) {
                    const query = LiveVariableUtils.generateSearchQuery(rule.rules, rule.condition, ignoreCase, skipEncode);
                    if (query !== '') {
                        params.push('(' + query + ')');
                    }
                } else {
                    const searchField = LiveVariableUtils.getSearchField(rule, LiveVariableUtils.getIgnoreCase(rule.filterCondition, ignoreCase), skipEncode);
                    if (!_.isNil(searchField)) {
                        params.push(searchField);
                    }
                }
            }
        });
        return _.join(params, ' ' + condition + ' ');
    }

    static prepareTableOptionsForFilterExps = (variable, options, clonedFields) => {
        if (!isDefined(options.searchWithQuery)) {
            options.searchWithQuery = true; // Using query api instead of  search api
        }

        const filterOptions = [];
        let orderByFields,
            orderByOptions,
            query;
        let clonedObj  = clonedFields || getClonedObject(variable.filterExpressions);

        // if filterexpression from live filter is present use it to query
        if (options.filterExpr && !_.isEmpty(options.filterExpr)) {
            clonedObj = options.filterExpr;
        }
        // merge live filter runtime values
        let filterRules: any = {};
        if (!_.isEmpty(options.filterFields)) {
            filterRules = {'condition': options.logicalOp || 'AND', 'rules': []};
            _.forEach(options.filterFields, (filterObj, filterName) => {
                if (!_.isNil(filterObj.value) && filterObj.value !== '') {
                    const type = filterObj.type || LiveVariableUtils.getSqlType(variable, filterName);
                    const ruleObj = {
                        'target': filterName,
                        'type': type,
                        'matchMode': filterObj.matchMode || (LiveVariableUtils.isStringType(type) ? 'startignorecase' : "exact"),
                        'value': filterObj.value,
                        'required': filterObj.required || false
                    };
                    filterRules.rules.push(ruleObj);
                }
            });
        }
        if (!_.isEmpty(clonedObj)) {
            if (!_.isNil(filterRules.rules) && filterRules.rules.length) {
                // combine both the rules using 'AND'
                const tempRules = {'condition': 'AND', 'rules': []};
                tempRules.rules.push(getClonedObject(clonedObj));
                tempRules.rules.push(filterRules);
                clonedObj = tempRules;
            }
        } else {
            clonedObj = filterRules;
        }

        LiveVariableUtils.processFilterFields(clonedObj.rules, variable, options);
        query = LiveVariableUtils.generateSearchQuery(clonedObj.rules, clonedObj.condition, variable.ignoreCase, options.skipEncode);

        orderByFields = getEvaluatedOrderBy(variable.orderBy, options.orderBy);
        orderByOptions = orderByFields ? 'sort=' + orderByFields : '';

        return {
            'filter' : filterOptions,
            'sort'   : orderByOptions,
            'query'  : query
        };
    }

    static prepareTableOptions = (variable, options, clonedFields?) => {
        if (variable.operation === 'read') {
            return LiveVariableUtils.prepareTableOptionsForFilterExps(variable, options, clonedFields);
        }
        if (!isDefined(options.searchWithQuery)) {
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
        _.forEach(clonedFields, (value, key) => {
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
        _.forEach(options.filterFields, (value, key) => {
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
            result = _.find(columns, obj => {
                return obj.fieldName === fieldName;
            });
            // if related field name passed, get its type from columns inside the current field
            if (relatedField && result) {
                result = _.find(result.columns, obj => {
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
        _.forEach(rowObject, (colValue, colName) => {
            if (LiveVariableUtils.getFieldType(colName, variableDetails) === 'blob') {
                if (_.isObject(colValue)) {
                    if (_.isArray(colValue)) {
                        _.forEach(colValue, fileObject => {
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
            _.forEach(rowObject, (value, key) => {
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
            _.forEach(inputFields, (attrValue, attrName) => {
                if (attrValue && !rowObject[attrName]) {
                    rowObject[attrName] = attrValue;
                }
            });
        } else {
            _.forEach(inputFields, (fieldValue, fieldName) => {
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
                        primaryKeys.forEach(key => {
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
                        _.forEach(fieldValue, (val, key) => {
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
                        primaryKey.forEach(key => {
                            compositeKeysData[key] = rowObject[key];
                            prevCompositeKeysData[key] = prevData[key] || (options.rowData && options.rowData[key]) || rowObject[key];
                        });
                    }
                    options.row = compositeKeysData;
                    options.compositeKeysData = prevCompositeKeysData;
                } else {
                    primaryKey.forEach((key) => {
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
                        primaryKey.forEach(key => {
                            compositeKeysData[key] = rowObject[key];
                        });
                    }
                    options.compositeKeysData = compositeKeysData;
                } else if (!_.isEmpty(rowObject)) {
                    primaryKey.forEach(key => {
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
        }).then((response, xhrObj) => {
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
        }, (response, details, xhrObj) => {
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

    static traverseFilterExpressions = (filterExpressions, traverseCallbackFn) => {
        if (filterExpressions.rules) {
            _.forEach(filterExpressions.rules, (filExpObj, i) => {
                if (filExpObj.rules) {
                    LiveVariableUtils.traverseFilterExpressions(filExpObj, traverseCallbackFn);
                } else {
                    return triggerFn(traverseCallbackFn, filterExpressions, filExpObj);
                }
            });
        }
    }

    /**
     * Traverses recursively the filterExpressions object and if there is any required field present with no value,
     * then we will return without proceeding further. Its upto the developer to provide the mandatory value,
     * if he wants to assign it in teh onbefore<delete/insert/update>function then make that field in
     * the filter query section as optional
     * @param filterExpressions - recursive rule Object
     * @returns {Object} object or boolean. Object if everything gets validated or else just boolean indicating failure in the validations
     */
    static getFilterExprFields = (filterExpressions) => {
        let isRequiredFieldAbsent = false;
        const traverseCallbackFn = (parentFilExpObj, filExpObj) => {
            if (filExpObj
                && filExpObj.required
                && ((_.indexOf(['null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'], filExpObj.matchMode) === -1) && filExpObj.value === '')) {
                isRequiredFieldAbsent = true;
                return false;
            }
        };
        LiveVariableUtils.traverseFilterExpressions(filterExpressions, traverseCallbackFn);
        return isRequiredFieldAbsent ? !isRequiredFieldAbsent : filterExpressions;
    }

    /**
     *
     * @param variable
     * @param options
     * @returns {function(*=): *} returns a function which should be called for the where clause.
     * This return function can take a function as argument. This argument function can modify the filter fields
     * before generating where clause.
     */
    static getWhereClauseGenerator = (variable, options) => {
        return modifier => {
            const clonedFields = LiveVariableUtils.getFilterExprFields(getClonedObject(variable.filterExpressions));
            if (modifier) {
                modifier(clonedFields);
            }
            return LiveVariableUtils.prepareTableOptions(variable, options, clonedFields).query;
        };
    }
}

