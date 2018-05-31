import { DataSource } from '@wm/core';
import { FormWidgetType, isDefined, MatchMode } from '@wm/core';

import { isDataSetWidget } from './widget-utils';

declare const _;

const noop = () => {};

export enum Live_Operations {
    INSERT = 'insert',
    UPDATE = 'update',
    DELETE = 'delete'
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
        }
    });
}

export function refreshDataSource(dataSource, options): Promise<any> {
    return new Promise((res, rej) => {
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
    // TODO: For autocomplete widget, set the dataset and  related field. Autocomplete widget will make the call to get related data

    dataSource.execute(DataSource.Operation.GET_RELATED_TABLE_DATA, {
        relatedField,
        'pagesize': formField.limit,
        'orderBy': formField.orderby ? _.replace(formField.orderby, /:/g, ' ') : '',
    }).then(response => {
        formField.dataset = response;
        formField.displayfield = formField.displayfield || _.head(_.keys(_.get(response, '[0]')));
    }, noop);
}

/**
 * @ngdoc function
 * @name wm.widgets.live.LiveWidgetUtils#getDistinctFieldProperties
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * Returns the properties required for dataset widgets
 *
 * @param {object} variable variable for the widget
 * @param {object} formField definition of the column/ field
 *
 */
function getDistinctFieldProperties(dataSource, formField) {
    const props: any = {};
    let fieldColumn;
    if (formField['is-related']) {
        props.tableName     = formField['lookup-type'];
        fieldColumn         = formField['lookup-field'];
        props.distinctField = fieldColumn;
        props.aliasColumn   = fieldColumn.replace('.', '$'); // For related fields, In response . is replaced by $
    } else {
        props.tableName     = dataSource.execute(DataSource.Operation.GET_ENTITY_NAME);
        fieldColumn         = formField.field || formField.key;
        props.distinctField = fieldColumn;
        props.aliasColumn   = fieldColumn;
    }
    return props;
}

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
                'fields'        : props.distinctField,
                'entityName'    : props.tableName,
                'pagesize'      : formField.limit
            }).then(data => {
                res({'field': formField, 'data': data, 'aliasColumn': props.aliasColumn});
            }, rej);
        }
    });
}

// Set the data field properties on dataset widgets
function setDataFields(formField, options?) {
    // TODO: For search widget, set search key and display label
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
    const emptySupportWidgets = [FormWidgetType.SELECT, FormWidgetType.RADIOSET, FormWidgetType.CHECKBOXSET];
    const emptyOption         = {};
    const dataSet = [];
    if (options.isEnableEmptyFilter && _.includes(emptySupportWidgets, formField[options.widget]) &&
        !formField['is-range'] && !formField.multiple) {
        // If empty option is selected, push an empty object in to dataSet
        emptyOption[LIVE_CONSTANTS.LABEL_KEY]   = LIVE_CONSTANTS.EMPTY_KEY;
        emptyOption[LIVE_CONSTANTS.LABEL_VALUE] = LIVE_CONSTANTS.EMPTY_VALUE;
        dataSet.push(emptyOption);
    }
    _.each(data.content, key => {
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
    // TODO: For autocomplete widget, widget will fetch the data. Set properties on the widget itself. Other widgets, fetch the data.
    getDistinctValues(dataSource, formField, options.widget).then((res: any) => {
        setFieldDataSet(res.field, res.data, {
            aliasColumn: res.aliasColumn,
            widget: options.widget,
            isEnableEmptyFilter: getEnableEmptyFilter(options.enableemptyfilter)
        });
    });
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
    if (isDefined(minValue) && isDefined(maxValue)) {
        fieldValue = [minValue, maxValue];
    } else if (isDefined(minValue)) {
        fieldValue = minValue;
    } else if (isDefined(maxValue)) {
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
    if (isDefined(minValue) && isDefined(maxValue)) {
        matchMode = MatchMode.BETWEEN;
    } else if (isDefined(minValue)) {
        matchMode = MatchMode.GREATER;
    } else if (isDefined(maxValue)) {
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
}

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

    newVal = isDefined(newVal) ? newVal : ((filterDef['is-range'] ? getRangeFieldValue(filterDef.minValue, filterDef.maxValue) : filterDef.value));
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
        if (filterDef && filterDef.isRelated) {
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

        // TODO: handle search widget
        if (isSearchWidgetType(filterWidget) && filterField.dataoptions) {
            filterField.dataoptions.filterFields = filterFields;
        } else {
            dataSource.execute(DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS, {
                'fields'        : fieldColumn,
                'filterFields'  : filterFields,
                'pagesize'      : filterField.limit
            }).then(data => {
                setFieldDataSet(filterField, data, {
                    aliasColumn: fieldColumn,
                    widget: 'widget',
                    isEnableEmptyFilter: getEnableEmptyFilter(options.enableemptyfilter)
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
