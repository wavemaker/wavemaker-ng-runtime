import { hasCordova, getClonedObject, isDateTimeType, isDefined, replace, triggerFn, isNumberType } from "../../util/utils";
import { $rootScope, DB_CONSTANTS, SWAGGER_CONSTANTS } from '../../constants/variables.constants';
import { getEvaluatedOrderBy, formatDate } from './variables.utils';
var LiveVariableUtils = /** @class */ (function () {
    function LiveVariableUtils() {
    }
    LiveVariableUtils.isCompositeKey = function (primaryKey) {
        return !primaryKey || (primaryKey && (!primaryKey.length || primaryKey.length > 1));
    };
    LiveVariableUtils.isNoPrimaryKey = function (primaryKey) {
        return (!primaryKey || (primaryKey && !primaryKey.length));
    };
    // Generate the URL based on the primary keys and their values
    LiveVariableUtils.getCompositeIDURL = function (primaryKeysData) {
        var compositeId = '';
        //  Loop over the 'compositeKeysData' and construct the 'compositeId'.
        _.forEach(primaryKeysData, function (paramValue, paramName) {
            compositeId += paramName + '=' + encodeURIComponent(paramValue) + '&';
        });
        compositeId = compositeId.slice(0, -1);
        return compositeId;
    };
    // Check if table has blob column
    LiveVariableUtils.hasBlob = function (variable) {
        return _.find(_.get(variable, ['propertiesMap', 'columns']), { 'type': 'blob' });
    };
    LiveVariableUtils.getPrimaryKey = function (variable) {
        if (!variable.propertiesMap) {
            return [];
        }
        if (variable.propertiesMap.primaryFields) {
            return variable.propertiesMap.primaryFields;
        }
        /*Old projects do not have primary fields. Get primary key from the columns*/
        var primaryKey = [];
        /*Loop through the propertiesMap and get the primary key column.*/
        _.forEach(variable.propertiesMap.columns, function (index, column) {
            if (column.isPrimaryKey) {
                if (column.isRelated && (!_.includes(column.relatedFieldName, primaryKey))) {
                    primaryKey.push(column.relatedFieldName);
                }
                else if (!_.includes(column.fieldName, primaryKey)) {
                    primaryKey.push(column.fieldName);
                }
            }
        });
        return primaryKey;
    };
    //  Construct the URL for blob columns and set it in the data, so that widgets can use this
    LiveVariableUtils.processBlobColumns = function (responseData, variable) {
        if (!responseData) {
            return;
        }
        var blobCols = _.map(_.filter(variable.propertiesMap.columns, { 'type': 'blob' }), 'fieldName'), deployedUrl = _.trim($rootScope.project.deployedUrl);
        var href = '', primaryKeys;
        if (_.isEmpty(blobCols)) {
            return;
        }
        if (hasCordova()) {
            href += _.endsWith(deployedUrl, '/') ? deployedUrl : deployedUrl + '/';
        }
        href += ((variable._prefabName !== '' && variable._prefabName !== undefined) ? 'prefabs/' + variable._prefabName : 'services') + '/' + variable.liveSource + '/' + variable.type + '/';
        primaryKeys = variable.propertiesMap.primaryFields || variable.propertiesMap.primaryKeys;
        _.forEach(responseData, function (data) {
            if (data) {
                _.forEach(blobCols, function (col) {
                    var compositeKeysData = {};
                    if (data[col] === null || !_.isEmpty(_.trim(data[col]))) {
                        return;
                    }
                    if (LiveVariableUtils.isCompositeKey(primaryKeys)) {
                        primaryKeys.forEach(function (key) {
                            compositeKeysData[key] = data[key];
                        });
                        data[col] = href + 'composite-id/content/' + col + '?' + LiveVariableUtils.getCompositeIDURL(compositeKeysData);
                    }
                    else {
                        data[col] = href + data[_.join(primaryKeys)] + '/content/' + col;
                    }
                });
            }
        });
    };
    LiveVariableUtils.getHibernateOrSqlType = function (variable, fieldName, type, entityName) {
        var columns = variable.propertiesMap.columns;
        var column, relatedCols, relatedCol, columnParts;
        if (_.includes(fieldName, '.')) {
            columnParts = fieldName.split('.');
            if (columnParts.length > 2) {
                return undefined;
            }
            column = _.find(columns, function (col) {
                return col.fieldName === columnParts[0];
            });
            relatedCols = column && column.columns;
            relatedCol = _.find(relatedCols, function (col) {
                return col.fieldName === columnParts[1];
            });
            return relatedCol && relatedCol[type];
        }
        column = _.find(columns, function (col) {
            return col.fieldName === fieldName || col.relatedColumnName === fieldName;
        });
        if (!column && entityName) {
            var entity = _.find(columns, function (col) { return col.relatedEntityName === entityName; });
            column = _.find(entity.columns, function (col) {
                return col.fieldName === fieldName || col.relatedColumnName === fieldName;
            });
        }
        return column && column[type];
    };
    /*Function to get the sqlType of the specified field.*/
    LiveVariableUtils.getSqlType = function (variable, fieldName, entityName) {
        return LiveVariableUtils.getHibernateOrSqlType(variable, fieldName, 'type', entityName);
    };
    /*Function to check if the specified field has a one-to-many relation or not.*/
    LiveVariableUtils.isRelatedFieldMany = function (variable, fieldName) {
        var columns = variable.propertiesMap.columns, columnsCount = columns.length;
        var index, column;
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
    };
    LiveVariableUtils.isStringType = function (type) {
        return _.includes(['text', 'string'], _.toLower(type));
    };
    LiveVariableUtils.getSQLFieldType = function (variable, options) {
        if (_.includes(['timestamp', 'datetime', 'date'], options.type)) {
            return options.type;
        }
        return LiveVariableUtils.getSqlType(variable, options.fieldName) || options.type;
    };
    LiveVariableUtils.getAttributeName = function (variable, fieldName) {
        var attrName = fieldName;
        variable.propertiesMap.columns.forEach(function (column) {
            if (column.fieldName === fieldName && column.isRelated) {
                attrName = column.relatedFieldName;
            }
        });
        return attrName;
    };
    LiveVariableUtils.getFilterCondition = function (filterCondition) {
        if (_.includes(DB_CONSTANTS.DATABASE_RANGE_MATCH_MODES, filterCondition)) {
            return filterCondition;
        }
        return DB_CONSTANTS.DATABASE_MATCH_MODES['exact'];
    };
    LiveVariableUtils.getFilterOption = function (variable, fieldOptions, options) {
        var attributeName, fieldValue = fieldOptions.value, filterOption, filterCondition;
        var matchModes = DB_CONSTANTS.DATABASE_MATCH_MODES, fieldName = fieldOptions.fieldName, fieldRequired = fieldOptions.required || false, fieldType = LiveVariableUtils.getSQLFieldType(variable, fieldOptions);
        filterCondition = matchModes[fieldOptions.matchMode] || matchModes[fieldOptions.filterCondition] || fieldOptions.filterCondition;
        fieldOptions.type = fieldType;
        /* if the field value is an object(complex type), loop over each field inside and push only first level fields */
        if (_.isObject(fieldValue) && !_.isArray(fieldValue)) {
            var firstLevelValues_1 = [];
            _.forEach(fieldValue, function (subFieldValue, subFieldName) {
                if (subFieldValue && !_.isObject(subFieldValue)) {
                    firstLevelValues_1.push(fieldName + '.' + subFieldName + '=' + subFieldValue);
                }
            });
            return firstLevelValues_1;
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
                        fieldValue = _.isArray(fieldValue) ? _.reduce(fieldValue, function (result, value) {
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
                        // ToDo - variable seperation
                        fieldValue = formatDate(fieldValue, fieldType);
                        filterCondition = filterCondition ? LiveVariableUtils.getFilterCondition(filterCondition) : matchModes['exact'];
                        break;
                    case 'text':
                    case 'string':
                        if (_.isArray(fieldValue)) {
                            filterCondition = _.includes([matchModes['in'], matchModes['notin']], filterCondition) ? filterCondition : matchModes['exact'];
                        }
                        else {
                            filterCondition = filterCondition || matchModes['anywhereignorecase'];
                        }
                        break;
                    default:
                        filterCondition = filterCondition ? LiveVariableUtils.getFilterCondition(filterCondition) : matchModes['exact'];
                        break;
                }
            }
            else {
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
    };
    LiveVariableUtils.getFilterOptions = function (variable, filterFields, options) {
        var filterOptions = [];
        _.each(filterFields, function (fieldOptions) {
            var filterOption = LiveVariableUtils.getFilterOption(variable, fieldOptions, options);
            if (!_.isNil(filterOption)) {
                if (_.isArray(filterOption)) {
                    filterOptions = filterOptions.concat(filterOption);
                }
                else {
                    filterOptions.push(filterOption);
                }
            }
        });
        return filterOptions;
    };
    // Wrap the field name and value in lower() in ignore case scenario
    // TODO: Change the function name to represent the added functionality of identifiers for datetime, timestamp and float types. Previously only lower was warapped.
    LiveVariableUtils.wrapInLowerCase = function (value, options, ignoreCase, isField) {
        var type = _.toLower(options.attributeType);
        // If ignore case is true and type is string/ text and match mode is string type, wrap in lower()
        if (ignoreCase && (!type || LiveVariableUtils.isStringType(type)) && _.includes(DB_CONSTANTS.DATABASE_STRING_MODES, options.filterCondition)) {
            return 'lower(' + value + ')';
        }
        return value;
    };
    LiveVariableUtils.encodeAndAddQuotes = function (value, type, skipEncode) {
        var encodedValue = skipEncode ? value : encodeURIComponent(value);
        type = _.toLower(type);
        encodedValue = _.replace(encodedValue, /'/g, '\'\'');
        // For number types, don't wrap the value in quotes
        if ((isNumberType(type) && type !== 'float')) {
            return encodedValue;
        }
        return '\'' + encodedValue + '\'';
    };
    LiveVariableUtils.getParamValue = function (value, options, ignoreCase, skipEncode) {
        var param;
        var filterCondition = options.filterCondition, dbModes = DB_CONSTANTS.DATABASE_MATCH_MODES, type = options.attributeType;
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
            case dbModes.nowhereignorecase:
            case dbModes.nowhere:
            case dbModes.anywhereignorecase:
            case dbModes.anywhere:
                param = LiveVariableUtils.encodeAndAddQuotes('%' + value + '%', type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
            case dbModes.between:
                param = _.join(_.map(value, function (val) {
                    return LiveVariableUtils.wrapInLowerCase(LiveVariableUtils.encodeAndAddQuotes(val, type, skipEncode), options, ignoreCase);
                }), ' and ');
                break;
            case dbModes.in:
            case dbModes.notin:
                param = _.join(_.map(value, function (val) {
                    return LiveVariableUtils.wrapInLowerCase(LiveVariableUtils.encodeAndAddQuotes(val, type, skipEncode), options, ignoreCase);
                }), ', ');
                param = '(' + param + ')';
                break;
            /*case dbModes.exactignorecase:
            case dbModes.exact:
            case dbModes.notequals:
            The above three cases will be handled by default*/
            default:
                param = LiveVariableUtils.encodeAndAddQuotes(value, type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
        }
        return isDefined(param) ? param : '';
    };
    LiveVariableUtils.getSearchQuery = function (filterOptions, operator, ignoreCase, skipEncode) {
        var query;
        var params = [];
        _.forEach(filterOptions, function (fieldValue) {
            var value = fieldValue.attributeValue, dbModes = DB_CONSTANTS.DATABASE_MATCH_MODES, isValArray = _.isArray(value);
            var fieldName = fieldValue.attributeName, filterCondition = fieldValue.filterCondition, matchModeExpr, paramValue;
            // If value is an empty array, do not generate the query
            // If values is NaN and number type, do not generate query for this field
            if ((isValArray && _.isEmpty(value)) || (!isValArray && isNaN(value) && (isNumberType(fieldValue.attributeType))) || (!isValArray && (isNaN(value) && !moment(value).isValid() && isDateTimeType(_.toLower(fieldValue.attributeType))))) {
                return;
            }
            if (isValArray) {
                // If array is value and mode is between, pass between. Else pass as in query
                filterCondition = filterCondition === dbModes.between || filterCondition === dbModes.notin ? filterCondition : dbModes.in;
                fieldValue.filterCondition = filterCondition;
            }
            matchModeExpr = DB_CONSTANTS.DATABASE_MATCH_MODES_WITH_QUERY[filterCondition];
            paramValue = LiveVariableUtils.getParamValue(value, fieldValue, ignoreCase, skipEncode);
            fieldName = LiveVariableUtils.wrapInLowerCase(fieldName, fieldValue, ignoreCase);
            params.push(replace(matchModeExpr, [fieldName, paramValue]));
        });
        query = _.join(params, operator); // empty space added intentionally around OR
        return query;
    };
    /**
     * creating the proper values from the actual object like for between,in matchModes value has to be an array like [1,2]
     * @param rules recursive filterexpressions object
     * @param variable variable object
     * @param options options
     */
    LiveVariableUtils.processFilterFields = function (rules, variable, options) {
        _.remove(rules, function (rule) {
            return rule && (_.isString(rule.value) && rule.value.indexOf('bind:') === 0 || (rule.matchMode === 'between' ? (_.isString(rule.secondvalue) && rule.secondvalue.indexOf('bind:') === 0) : false));
        });
        _.forEach(rules, function (rule, index) {
            if (rule) {
                if (rule.rules) {
                    LiveVariableUtils.processFilterFields(rule.rules, variable, options);
                }
                else {
                    if (!_.isNull(rule.target)) {
                        var value = rule.matchMode.toLowerCase() === DB_CONSTANTS.DATABASE_MATCH_MODES.between.toLowerCase()
                            ? (_.isArray(rule.value) ? rule.value : [rule.value, rule.secondvalue])
                            : (rule.matchMode.toLowerCase() === DB_CONSTANTS.DATABASE_MATCH_MODES.in.toLowerCase() || rule.matchMode.toLowerCase() === DB_CONSTANTS.DATABASE_MATCH_MODES.notin.toLowerCase()
                                ? (_.isArray(rule.value) ? rule.value : (rule.value ? rule.value.split(',').map(function (val) { return val.trim(); }) : ''))
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
    };
    LiveVariableUtils.getSearchField = function (fieldValue, ignoreCase, skipEncode) {
        var fieldName = fieldValue.attributeName;
        var matchModeExpr;
        var paramValue;
        var filterCondition = fieldValue.filterCondition;
        var value = fieldValue.attributeValue;
        var isValArray = _.isArray(value);
        var dbModes = DB_CONSTANTS.DATABASE_MATCH_MODES;
        // If value is an empty array, do not generate the query
        // If values is NaN and number type, do not generate query for this field
        if ((isValArray && _.isEmpty(value)) ||
            (isValArray && _.some(value, function (val) { return (_.isNull(val) || _.isNaN(val) || val === ''); })) ||
            (!isValArray && (isNaN(value) && (isNumberType(fieldValue.attributeType)))) ||
            (!isValArray && (isNaN(value) && !moment(value).isValid() && isDateTimeType(_.toLower(fieldValue.attributeType))))) {
            return;
        }
        if (isValArray) {
            // If array is value and mode is between, pass between. Else pass as in query
            filterCondition = filterCondition === dbModes.between || filterCondition === dbModes.notin ? filterCondition : dbModes.in;
            fieldValue.filterCondition = filterCondition;
        }
        matchModeExpr = DB_CONSTANTS.DATABASE_MATCH_MODES_WITH_QUERY[filterCondition];
        paramValue = LiveVariableUtils.getParamValue(value, fieldValue, ignoreCase, skipEncode);
        fieldName = LiveVariableUtils.wrapInLowerCase(fieldName, fieldValue, ignoreCase);
        return replace(matchModeExpr, [fieldName, paramValue]);
    };
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
    LiveVariableUtils.getIgnoreCase = function (matchMode, ignoreCase) {
        var matchModes = DB_CONSTANTS.DATABASE_MATCH_MODES;
        if (_.indexOf([matchModes['anywhere'], matchModes['nowhere'], matchModes['start'], matchModes['end'], matchModes['exact']], matchMode) !== -1) {
            return false;
        }
        if (_.indexOf([matchModes['anywhereignorecase'], matchModes['nowhereignorecase'], matchModes['startignorecase'], matchModes['endignorecase'], matchModes['exactignorecase']], matchMode) !== -1) {
            return true;
        }
        return ignoreCase;
    };
    LiveVariableUtils.generateSearchQuery = function (rules, condition, ignoreCase, skipEncode) {
        var params = [];
        _.forEach(rules, function (rule) {
            if (rule) {
                if (rule.rules) {
                    var query = LiveVariableUtils.generateSearchQuery(rule.rules, rule.condition, ignoreCase, skipEncode);
                    if (query !== '') {
                        params.push('(' + query + ')');
                    }
                }
                else {
                    var searchField = LiveVariableUtils.getSearchField(rule, LiveVariableUtils.getIgnoreCase(rule.filterCondition, ignoreCase), skipEncode);
                    if (!_.isNil(searchField)) {
                        params.push(searchField);
                    }
                }
            }
        });
        return _.join(params, ' ' + condition + ' ');
    };
    LiveVariableUtils.prepareTableOptionsForFilterExps = function (variable, options, clonedFields) {
        if (!isDefined(options.searchWithQuery)) {
            options.searchWithQuery = true; // Using query api instead of  search api
        }
        var filterOptions = [];
        var matchModes = DB_CONSTANTS.DATABASE_MATCH_MODES;
        var orderByFields, orderByOptions, query;
        var clonedObj = clonedFields || getClonedObject(variable.filterExpressions);
        // if filterexpression from live filter is present use it to query
        if (options.filterExpr && !_.isEmpty(options.filterExpr)) {
            clonedObj = options.filterExpr;
        }
        // merge live filter runtime values
        var filterRules = {};
        if (!_.isEmpty(options.filterFields)) {
            var operator = '';
            for (var field in options.filterFields) {
                operator = options.filterFields[field]['logicalOp'] || '';
                break;
            }
            filterRules = { 'condition': options.logicalOp || operator || 'AND', 'rules': [] };
            _.forEach(options.filterFields, function (filterObj, filterName) {
                var filterCondition = matchModes[filterObj.matchMode] || matchModes[filterObj.filterCondition] || filterObj.filterCondition;
                if (_.includes(DB_CONSTANTS.DATABASE_EMPTY_MATCH_MODES, filterCondition) ||
                    (!_.isNil(filterObj.value) && filterObj.value !== '')) {
                    var type = filterObj.type || LiveVariableUtils.getSqlType(variable, filterName, options.entityName);
                    var ruleObj = {
                        'target': filterName,
                        'type': type,
                        'matchMode': filterObj.matchMode || (LiveVariableUtils.isStringType(type) ? 'startignorecase' : 'exact'),
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
                var tempRules = { 'condition': 'AND', 'rules': [] };
                tempRules.rules.push(getClonedObject(clonedObj));
                tempRules.rules.push(filterRules);
                clonedObj = tempRules;
            }
        }
        else {
            clonedObj = filterRules;
        }
        LiveVariableUtils.processFilterFields(clonedObj.rules, variable, options);
        query = LiveVariableUtils.generateSearchQuery(clonedObj.rules, clonedObj.condition, variable.ignoreCase, options.skipEncode);
        orderByFields = getEvaluatedOrderBy(variable.orderBy, options.orderBy);
        orderByOptions = orderByFields ? 'sort=' + orderByFields : '';
        return {
            'filter': filterOptions,
            'sort': orderByOptions,
            'query': query
        };
    };
    LiveVariableUtils.prepareTableOptions = function (variable, options, clonedFields) {
        if (variable.operation === 'read') {
            return LiveVariableUtils.prepareTableOptionsForFilterExps(variable, options, clonedFields);
        }
        if (!isDefined(options.searchWithQuery)) {
            options.searchWithQuery = true; //  Using query api instead of  search api
        }
        var filterFields = [];
        var filterOptions = [], orderByFields, orderByOptions, query, optionsQuery;
        clonedFields = clonedFields || variable.filterFields;
        // get the filter fields from the variable
        _.forEach(clonedFields, function (value, key) {
            if (_.isObject(value) && (!options.filterFields || !options.filterFields[key] || options.filterFields[key].logicalOp === 'AND')) {
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
            query = LiveVariableUtils.getSearchQuery(_.filter(filterOptions, { 'isVariableFilter': true }), ' AND ', variable.ignoreCase, options.skipEncode);
            // Generate query for option filter fields. This has default logical operator as OR
            optionsQuery = LiveVariableUtils.getSearchQuery(_.filter(filterOptions, { 'isVariableFilter': undefined }), ' ' + (options.logicalOp || 'AND') + ' ', variable.ignoreCase, options.skipEncode);
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
    };
    /* Function to check if specified field is of type date*/
    LiveVariableUtils.getFieldType = function (fieldName, variable, relatedField) {
        var fieldType, columns, result;
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
    };
    // Prepare formData for blob columns
    LiveVariableUtils.prepareFormData = function (variableDetails, rowObject) {
        var formData = new FormData();
        formData.rowData = _.clone(rowObject);
        _.forEach(rowObject, function (colValue, colName) {
            if (LiveVariableUtils.getFieldType(colName, variableDetails) === 'blob') {
                if (_.isObject(colValue)) {
                    if (_.isArray(colValue)) {
                        _.forEach(colValue, function (fileObject) {
                            formData.append(colName, fileObject, fileObject.name);
                        });
                    }
                    else {
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
    };
    LiveVariableUtils.traverseFilterExpressions = function (filterExpressions, traverseCallbackFn) {
        if (filterExpressions && filterExpressions.rules) {
            _.forEach(filterExpressions.rules, function (filExpObj, i) {
                if (filExpObj.rules) {
                    LiveVariableUtils.traverseFilterExpressions(filExpObj, traverseCallbackFn);
                }
                else {
                    return triggerFn(traverseCallbackFn, filterExpressions, filExpObj);
                }
            });
        }
    };
    /**
     * Traverses recursively the filterExpressions object and if there is any required field present with no value,
     * then we will return without proceeding further. Its upto the developer to provide the mandatory value,
     * if he wants to assign it in teh onbefore<delete/insert/update>function then make that field in
     * the filter query section as optional
     * @param filterExpressions - recursive rule Object
     * @returns {Object} object or boolean. Object if everything gets validated or else just boolean indicating failure in the validations
     */
    LiveVariableUtils.getFilterExprFields = function (filterExpressions) {
        var isRequiredFieldAbsent = false;
        var traverseCallbackFn = function (parentFilExpObj, filExpObj) {
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
     *
     * @param variable
     * @param options
     * @returns {function(*=): *} returns a function which should be called for the where clause.
     * This return function can take a function as argument. This argument function can modify the filter fields
     * before generating where clause.
     */
    LiveVariableUtils.getWhereClauseGenerator = function (variable, options, updatedFilterFields) {
        return function (modifier, skipEncode) {
            var clonedFields = LiveVariableUtils.getFilterExprFields(getClonedObject(updatedFilterFields || variable.filterExpressions));
            // this flag skips the encoding of the query
            if (isDefined(skipEncode)) {
                options.skipEncode = skipEncode;
            }
            if (modifier) {
                // handling the scenario where variable can also have filterFields
                if (options.filterFields) {
                    modifier(clonedFields, options);
                }
                else {
                    modifier(clonedFields);
                }
            }
            return LiveVariableUtils.prepareTableOptions(variable, options, clonedFields).query;
        };
    };
    return LiveVariableUtils;
}());
export { LiveVariableUtils };
//# sourceMappingURL=live-variable.utils.js.map