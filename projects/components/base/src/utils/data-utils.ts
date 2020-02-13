import { DataSource, debounce, processFilterExpBindNode } from '@wm/core';
import { FormWidgetType, isDefined, MatchMode } from '@wm/core';

import { isDataSetWidget } from './widget-utils';

declare const _;

const noop = () => {};

export enum Live_Operations {
    INSERT = 'insert',
    UPDATE = 'update',
    DELETE = 'delete',
    READ = 'read'
}

export const ALLFIELDS = 'All Fields';

export const LIVE_CONSTANTS = {
    'EMPTY_KEY'     : 'EMPTY_NULL_FILTER',
    'EMPTY_VALUE'   : 'No Value',
    'LABEL_KEY'     : 'key',
    'LABEL_VALUE'   : 'value',
    'NULL_EMPTY'    : ['null', 'empty'],
    'NULL'          : 'null',
    'EMPTY'         : 'empty'
};

// Returns true if widget is autocomplete or chips
function isSearchWidgetType(widget) {
    return _.includes([FormWidgetType.AUTOCOMPLETE, FormWidgetType.TYPEAHEAD, FormWidgetType.CHIPS], widget);
}

function onSuccess(response, res, rej) {
    if (response.error) {
        rej(response);
    } else {
        res(response);
    }
}

export function performDataOperation(dataSource, requestData, options): Promise<any> {
    return new Promise((res, rej) => {
        if (dataSource.execute(DataSource.Operation.SUPPORTS_CRUD)) {
            let fn;
            const operationType = options.operationType;
            switch (operationType) {
                case Live_Operations.UPDATE:
                    fn = DataSource.Operation.UPDATE_RECORD;
                    break;
                case Live_Operations.INSERT:
                    fn = DataSource.Operation.INSERT_RECORD;
                    break;
                case  Live_Operations.DELETE:
                    fn = DataSource.Operation.DELETE_RECORD;
                    break;
            }
            dataSource.execute(fn, requestData).then(response => onSuccess(response, res, rej), rej);
        } else if (dataSource.execute(DataSource.Operation.IS_API_AWARE)) {
            dataSource.execute(DataSource.Operation.SET_INPUT, requestData);
            dataSource.execute(DataSource.Operation.INVOKE, {
                'skipNotification': true
            }).then(res, rej);
        } else {
            res(requestData);
        }
    });
}

export function refreshDataSource(dataSource, options): Promise<any> {
    return new Promise((res, rej) => {
        if (!dataSource) {
            rej();
            return;
        }
        dataSource.execute(DataSource.Operation.LIST_RECORDS, {
            'filterFields' : options.filterFields || {},
            'orderBy' : options.orderBy,
            'page': options.page || 1
        }).then(res, rej);
    });
}

/**
 * @ngdoc function
 * @name wm.widgets.live.fetchRelatedFieldData
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * This function fetches the data for the related field in live form/ grid
 *
 * @param {object} columnDef field definition
 * @param {string} relatedField related field name
 * @param {string} datafield Datafield to be set on widget
 * @param {string} widget Type of the widget
 * @param {object} elScope element scope
 * @param {object} parentScope live form// grid scope
 */
export function fetchRelatedFieldData(dataSource, formField, options) {
    let primaryKeys;
    let displayField;
    const relatedField = options.relatedField;
    const datafield = options.datafield;

    if (!dataSource) {
        return;
    }
    primaryKeys = dataSource.execute(DataSource.Operation.GET_RELATED_PRIMARY_KEYS, relatedField);
    formField.datafield = datafield;
    formField._primaryKey = _.isEmpty(primaryKeys) ? undefined : primaryKeys[0];
    formField.compareby = primaryKeys && primaryKeys.join(',');

    displayField = datafield === ALLFIELDS ? undefined : datafield;
    formField.displayfield = displayField = (formField.displayfield || displayField || formField._primaryKey);

    if (isSearchWidgetType(formField[options.widget])) {
        formField.dataoptions = {'relatedField': relatedField, 'filterExpr': formField.filterexpressions ? formField.filterexpressions : {}};
        formField.datasource = dataSource;
        formField.searchkey = formField.searchkey || displayField;
        formField.displaylabel = formField.displayfield = (formField.displaylabel || displayField);
    } else {
        interpolateBindExpressions(formField.viewParent, formField.filterexpressions, (filterexpressions) => {
            formField.filterexpressions = filterexpressions;
            dataSource.execute(DataSource.Operation.GET_RELATED_TABLE_DATA, {
                relatedField,
                pagesize: formField.limit,
                orderBy: formField.orderby ? _.replace(formField.orderby, /:/g, ' ') : '',
                filterFields: {},
                filterExpr: formField.filterexpressions ? formField.filterexpressions : {}
            }).then(response => {
                formField.dataset = response.data;
                formField.displayfield = formField.displayfield || _.head(_.keys(_.get(response, '[0]')));
            }, noop);
        });
    }
}

/**
 * used to interpolate the bind expression for keys in the query builder
 * @param context where we find the variable obj
 * @param filterexpressions - obj containing all the rule objs
 * @param callbackFn - function to be called with the new replaced values if any in the filterexpressions object
 */
export const interpolateBindExpressions = (context, filterexpressions, callbackFn) => {
    const debouncedFn = debounce(() => {
        if (_.isFunction(callbackFn)) {
            callbackFn(filterexpressions);
        }
    }, 300);

    /**
     * calling the debounced function first for the case where if there is any filterexpression without the bindedvariables.
     * without this it will never be called. processFilterExpBindNode will be called only for the binded variable expressions.
     */
    debouncedFn();
    const filterExpressions = filterexpressions ? (_.isObject(filterexpressions) ? filterexpressions : JSON.parse(filterexpressions)) : {};
    const destroyFn = context.registerDestroyListener ? context.registerDestroyListener.bind(context) : _.noop;
    const filterSubscription =  processFilterExpBindNode(context, filterExpressions).subscribe((response: any) => {
        filterexpressions = JSON.stringify(response.filterExpressions);
        debouncedFn();
    });
    destroyFn(() => filterSubscription.unsubscribe());
};
/**
 * @ngdoc function
 * @name wm.widgets.live.LiveWidgetUtils#getDistinctFieldProperties
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Returns the properties required for dataset widgets
 *
 * @param {object} dataSource variable source for the widget
 * @param {object} formField definition of the column/ field
 *
 */
export const getDistinctFieldProperties = (dataSource, formField) => {
    const props: any = {};
    let fieldColumn;
    if (formField['is-related']) {
        props.tableName     = formField['lookup-type'];
        fieldColumn         = formField['lookup-field'];
        props.distinctField = fieldColumn;
        props.aliasColumn   = fieldColumn.replace('.', '$'); // For related fields, In response . is replaced by $
        props.filterExpr    = formField.filterexpressions ? (_.isObject(formField.filterexpressions) ? formField.filterexpressions : JSON.parse(formField.filterexpressions)) : {};
    } else {
        props.tableName     = dataSource.execute(DataSource.Operation.GET_ENTITY_NAME);
        fieldColumn         = formField.field || formField.key;
        props.distinctField = fieldColumn;
        props.aliasColumn   = fieldColumn;
    }
    return props;
};

/**
 * @ngdoc function
 * @name wm.widgets.live.LiveWidgetUtils#getDistinctValues
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Returns the distinct values for a field
 *
 * @param {object} formField definition of the column/ field
 * @param {string} widget widget property on the field
 * @param {object} variable variable for the widget
 * @param {function} callBack Function to be executed after fetching results
 *
 */
export function getDistinctValues(dataSource, formField, widget) {
    let props;

    return new Promise((res, rej) => {
        if (isDataSetWidget(formField[widget]) && (!formField.isDataSetBound || widget === 'filterwidget')) {
            props = getDistinctFieldProperties(dataSource, formField);
            dataSource.execute(DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS, {
                fields: props.distinctField,
                entityName: props.tableName,
                pagesize: formField.limit,
                filterExpr: formField.filterexpressions ? JSON.parse(formField.filterexpressions) : {}
            }).then(response => {
                res({'field': formField, 'data': response.data, 'aliasColumn': props.aliasColumn});
            }, rej);
        }
    });
}

// Set the data field properties on dataset widgets
function setDataFields(formField, options?) {
    // For search widget, set search key and display label
    if (isSearchWidgetType(formField[options.widget])) {
        formField.datafield = options.aliasColumn || LIVE_CONSTANTS.LABEL_KEY;
        formField.searchkey = options.distinctField || LIVE_CONSTANTS.LABEL_KEY;
        formField.displaylabel = formField.displayfield = (options.aliasColumn || LIVE_CONSTANTS.LABEL_VALUE);
        return;
    }
    formField.datafield    = LIVE_CONSTANTS.LABEL_KEY;
    formField.displayfield = LIVE_CONSTANTS.LABEL_VALUE;
}

/**
 * @ngdoc function
 * @name wm.widgets.live.LiveWidgetUtils#setFieldDataSet
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Function to set the dataSet on the fields
 *
 * @param {object} formField definition of the column/ field
 * @param {object} data data returned from the server
 * @param {string} aliasColumn column field name
 * @param {string} widget widget property on the field
 * @param {boolean} isEnableEmptyFilter is null or empty values allowed on filter
 *
 */
function setFieldDataSet(formField, data, options?) {
    const emptySupportWidgets = [FormWidgetType.SELECT, FormWidgetType.RADIOSET];
    const emptyOption         = {};
    const dataSet = [];
    if (options.isEnableEmptyFilter && _.includes(emptySupportWidgets, formField[options.widget]) &&
        !formField['is-range'] && !formField.multiple) {
        // If empty option is selected, push an empty object in to dataSet
        emptyOption[LIVE_CONSTANTS.LABEL_KEY]   = LIVE_CONSTANTS.EMPTY_KEY;
        emptyOption[LIVE_CONSTANTS.LABEL_VALUE] = options.EMPTY_VALUE || LIVE_CONSTANTS.EMPTY_VALUE;
        dataSet.push(emptyOption);
    }
    _.each(data, key => {
        const value  = key[options.aliasColumn];
        const option = {};
        if (value !== null && value !== '') {
            option[LIVE_CONSTANTS.LABEL_KEY]   = value;
            option[LIVE_CONSTANTS.LABEL_VALUE] = value;
            dataSet.push(option);
        }
    });
    setDataFields(formField, options);
    formField.dataset = dataSet;
}

/**
 * @ngdoc function
 * @name wm.widgets.live.LiveWidgetUtils#fetchDistinctValues
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Function to fetch the distinct values for a field
 *
 * @param {object} scope scope of the widget
 * @param {object} formFields definitions of the column/ field
 * @param {string} widget widget property on the field
 * @param {boolean} isEnableEmptyFilter is null or empty values allowed on filter
 *
 */
export function fetchDistinctValues(dataSource, formFields, options) {
    if (_.isEmpty(formFields)) {
        return;
    }
    formFields.forEach(formField => {
        getDistinctValuesForField(dataSource, formField, options);
    });
}

/**
 * @ngdoc function
 * @name wm.widgets.live.LiveWidgetUtils#getDistinctValuesForField
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Function to fetch the distinct values for a field
 *
 * @param {object} scope scope of the widget
 * @param {object} formFields definitions of the column/ field
 * @param {string} widget widget property on the field
 * @param {boolean} isEnableEmptyFilter is null or empty values allowed on filter
 *
 */
export function getDistinctValuesForField(dataSource, formField, options?) {
    if (!dataSource || !formField || formField.isDataSetBound) {
        return;
    }
    if (isSearchWidgetType(formField[options.widget])) {
        const dataoptions =  getDistinctFieldProperties(dataSource, formField);
        formField.dataoptions = dataoptions;
        setDataFields(formField, Object.assign(options || {}, dataoptions));
        formField.datasource = dataSource;
    } else {
        interpolateBindExpressions(formField.viewParent, formField.filterexpressions, (filterexpressions) => {
            formField.filterexpressions = filterexpressions;
            getDistinctValues(dataSource, formField, options.widget).then((res: any) => {
                setFieldDataSet(res.field, res.data, {
                    aliasColumn: res.aliasColumn,
                    widget: options.widget,
                    isEnableEmptyFilter: getEnableEmptyFilter(options.enableemptyfilter),
                    EMPTY_VALUE: options.EMPTY_VALUE
                });
            });
        });
    }
}

function isDefinedAndNotEmpty(val) {
    return isDefined(val) && val !== '' && val !== null;
}

/**
 * @ngdoc function
 * @name wm.widgets.live.getRangeFieldValue
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Function to get the field value for range
 *
 * @param {string} minValue min value selected
 * @param {string} maxValue max value selected
 */
export function getRangeFieldValue(minValue, maxValue) {
    let fieldValue;
    if (isDefinedAndNotEmpty(minValue) && isDefinedAndNotEmpty(maxValue)) {
        fieldValue = [minValue, maxValue];
    } else if (isDefinedAndNotEmpty(minValue)) {
        fieldValue = minValue;
    } else if (isDefinedAndNotEmpty(maxValue)) {
        fieldValue = maxValue;
    }
    return fieldValue;
}
/**
 * @ngdoc function
 * @name wm.widgets.live.getRangeMatchMode
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Function to get the match mode for range
 *
 * @param {string} minValue min value selected
 * @param {string} maxValue max value selected
 */
export function getRangeMatchMode(minValue, maxValue) {
    let matchMode;
    // If two values exists, then it is between. Otherwise, greater or lesser
    if (isDefinedAndNotEmpty(minValue) && isDefinedAndNotEmpty(maxValue)) {
        matchMode = MatchMode.BETWEEN;
    } else if (isDefinedAndNotEmpty(minValue)) {
        matchMode = MatchMode.GREATER;
    } else if (isDefinedAndNotEmpty(maxValue)) {
        matchMode = MatchMode.LESSER;
    }
    return matchMode;
}
/**
 * @ngdoc function
 * @name wm.widgets.live.getEnableEmptyFilter
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * This function checks if enable filter options is set on live filter
 *
 * @param {object} enableemptyfilter empty filter options
 */
export function getEnableEmptyFilter(enableemptyfilter) {
    return enableemptyfilter && _.intersection(enableemptyfilter.split(','), LIVE_CONSTANTS.NULL_EMPTY).length > 0;
}
/**
 * @ngdoc function
 * @name wm.widgets.live.getEmptyMatchMode
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Function to get the match mode based on the filter selected
 *
 * @param {object} enableemptyfilter empty filter options
 */
export function getEmptyMatchMode(enableemptyfilter) {
    let matchMode;
    const emptyFilterOptions = _.split(enableemptyfilter, ',');
    if (_.intersection(emptyFilterOptions, LIVE_CONSTANTS.NULL_EMPTY).length === 2) {
        matchMode = MatchMode.NULLOREMPTY;
    } else if (_.includes(emptyFilterOptions, LIVE_CONSTANTS.NULL)) {
        matchMode = MatchMode.NULL;
    } else if (_.includes(emptyFilterOptions, LIVE_CONSTANTS.EMPTY)) {
        matchMode = MatchMode.EMPTY;
    }
    return matchMode;
}

/**
 * converts the data passed to array.
 *  -> Array: [1,2,3] - [1,2,3]
 *  -> String: a,b,c - ['a','b','c']
 *  -> object: {a:1} - [{a:1}]
 *  -> null - []
 *  -> undefined - []
 * @param data
 * @returns {Array<any>}
 */
export const createArrayFrom = (data): Array<any> => {

    if (_.isUndefined(data) || _.isNull(data)) {
        return [];
    }

    if (_.isString(data)) {
        data = data.split(',').map(Function.prototype.call, String.prototype.trim);
    }

    if (!_.isArray(data)) {
        data = [data];
    }

    return data;
};

/**
 * @ngdoc function
 * @name wm.widgets.live.applyFilterOnField
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Function to get the updated values when filter on field is changed
 *
 * @param {object} $scope scope of the filter field/form field
 * @param {object} filterDef filter/form definition of the field
 * @param {boolean} isFirst boolean value to check if this method is called on load
 */
export function applyFilterOnField(dataSource, filterDef, formFields, newVal, options: any = {}) {
    const fieldName      = filterDef.field || filterDef.key;
    const filterOnFields = _.filter(formFields, {'filter-on': fieldName});

    newVal = filterDef['is-range'] ? getRangeFieldValue(filterDef.minValue, filterDef.maxValue) : (isDefined(newVal) ? newVal : filterDef.value);
    if (!dataSource || (options.isFirst && (_.isUndefined(newVal) || newVal === ''))) {
        return;
    }
    // Loop over the fields for which the current field is filter on field
    _.forEach(filterOnFields, filterField => {
        const filterKey    = filterField.field || filterField.key;
        const lookUpField  = filterDef['lookup-field'] || filterDef._primaryKey;
        const filterWidget = filterField['edit-widget-type'] || filterField.widgettype;
        let filterFields = {};
        let filterOn     = filterField['filter-on'];
        let filterVal;
        let fieldColumn;
        let matchMode;
        if (!isDataSetWidget(filterWidget) || filterField.isDataSetBound || filterOn === filterKey) {
            return;
        }
        // For related fields, add lookupfield for query generation
        if (filterDef && filterDef['is-related']) {
            filterOn += '.' +  lookUpField;
        }
        if (isDefined(newVal)) {
            if (filterDef['is-range']) {
                matchMode = getRangeMatchMode(filterDef.minValue, filterDef.maxValue);
            } else if (getEnableEmptyFilter(options.enableemptyfilter) && newVal === LIVE_CONSTANTS.EMPTY_KEY) {
                matchMode = getEmptyMatchMode(options.enableemptyfilter);
            } else {
                matchMode = MatchMode.EQUALS;
            }
            filterVal = (_.isObject(newVal) && !_.isArray(newVal)) ? newVal[lookUpField] : newVal;
            filterFields[filterOn] = {
                'value'     : filterVal,
                'matchMode' : matchMode
            };
        } else {
            filterFields = {};
        }
        fieldColumn = filterKey;

        if (isSearchWidgetType(filterWidget) && filterField.dataoptions) {
            filterField.dataoptions.filterFields = filterFields;
        } else {
            dataSource.execute(DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS, {
                'fields'        : fieldColumn,
                'filterFields'  : filterFields,
                'pagesize'      : filterField.limit
            }).then(response => {
                setFieldDataSet(filterField, response.data, {
                    aliasColumn: fieldColumn,
                    widget: options.widget || 'widgettype',
                    isEnableEmptyFilter: getEnableEmptyFilter(options.enableemptyfilter),
                    EMPTY_VALUE: options.EMPTY_VALUE
                });
            }, noop);
        }
    });
}

// Transform data as required by data table
export function transformData(dataObject, variableName) {
    let newObj,
        tempArr,
        keys,
        oldKeys,
        numKeys,
        newObject,
        tempObj;

    // data sanity testing
    dataObject = dataObject || [];
    // if the dataObject is not an array make it an array
    if (!_.isArray(dataObject)) {
        // if the data returned is of type string, make it an object inside an array
        if (_.isString(dataObject)) {
            keys = variableName.substring(variableName.indexOf('.') + 1, variableName.length).split('.');
            oldKeys = [];
            numKeys = keys.length;
            newObject = {};
            tempObj = newObject;

            // loop over the keys to form appropriate data object required for grid
            keys.forEach((key, index) => {
                // loop over old keys to create new object at the iterative level
                oldKeys.forEach(oldKey  => {
                    tempObj = newObject[oldKey];
                });
                tempObj[key] = index === numKeys - 1 ? dataObject : {};
                oldKeys.push(key);
            });

            // change the string data to the new dataObject formed
            dataObject = newObject;
        }
        dataObject = [dataObject];
    } else {
        /*if the dataObject is an array and each value is a string, then lite-transform the string to an object
         * lite-transform: just checking if the first value is string and then transforming the object, instead of traversing through the whole array
         * */
        if (_.isString(dataObject[0])) {
            tempArr = [];
            _.forEach(dataObject, str => {
                newObj = {};
                newObj[variableName.split('.').join('-')] = str;
                tempArr.push(newObj);
            });
            dataObject = tempArr;
        }
    }
    return dataObject;
}
