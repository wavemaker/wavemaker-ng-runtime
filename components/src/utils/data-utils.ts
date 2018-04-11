import { isDataSetWidget } from './widget-utils';
import { DataSource } from '@wm/variables';

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

export function getDataSource(binddataset: string, parent: any) {
    let variableName,
        isBoundToVariable;
    const parts = binddataset.split('.');

    isBoundToVariable = _.includes(binddataset, 'Variables.');

    if (isBoundToVariable) {
        variableName = parts[1];
    }
    // TODO: Do it for bind widgets
    return parent && parent.Variables[variableName];
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
            // 'filterFields' : filterFields,
            // 'orderBy'      : sortOptions,
            'page': options.page || 1
        }).then(res, rej);
    });
}

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

function getDistinctFieldProperties(dataSource, formField) {
    const props: any = {};
    let fieldColumn;
    if (formField['is-related']) {
        props.tableName     = formField.lookupType;
        fieldColumn         = formField.lookupField;
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

function getDistinctValues(dataSource, formField, widget, callBack) {
    let props;

    if (isDataSetWidget(formField[widget]) && (!formField.isDataSetBound || widget === 'filterwidget')) {
        props = getDistinctFieldProperties(dataSource, formField);
        dataSource.execute(DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS, {
            'fields'        : props.distinctField,
            'entityName'    : props.tableName,
            'pagesize'      : formField.limit
        }).then(data => {
            callBack(formField, data, props.aliasColumn);
        }, noop);
    }
}

function setDataFields(formField, options?) {
    // TODO: For search widget, set search key and display label
    formField.datafield    = LIVE_CONSTANTS.LABEL_KEY;
    formField.displayfield = LIVE_CONSTANTS.LABEL_VALUE;
}

function setFieldDataSet(formField, data, options?) {
    const emptySupportWidgets = ['select', 'radioset'];
    const emptyOption         = {};
    const dataSet = [];
    if (options.isEnableEmptyFilter && _.includes(emptySupportWidgets, formField[options.widget]) &&
        !formField.isRange && !formField.multiple) {
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
    formField.dataset = dataSet;
    setDataFields(formField, options);
}

export function getDistinctValuesForField(dataSource, formField, options?) {
    if (!dataSource || !formField || formField.isDataSetBound) {
        return;
    }
    // TODO: For autocomplete widget, widget will fetch the data. Set properties on the widget itself. Other widgets, fetch the data.
    getDistinctValues(dataSource, formField, options.widget, (field, data, aliasColumn) => setFieldDataSet(field, data, {
        aliasColumn: aliasColumn,
        widget: options.widget,
        isEnableEmptyFilter: options.isEnableEmptyFilter
    }));
}