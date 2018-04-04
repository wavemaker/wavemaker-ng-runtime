import {isDataSetWidget} from './widget-utils';

declare const _;

export const ALLFIELDS = 'All Fields';

const VARIABLE_CATEGORY = {
    'LIVE': 'wm.LiveVariable',
    'SERVICE': 'wm.ServiceVariable'
};

export const LIVE_CONSTANTS = {
    'EMPTY_KEY'     : 'EMPTY_NULL_FILTER',
    'EMPTY_VALUE'   : 'No Value',
    'LABEL_KEY'     : 'key',
    'LABEL_VALUE'   : 'value',
    'NULL_EMPTY'    : ['null', 'empty'],
    'NULL'          : 'null',
    'EMPTY'         : 'empty'
};

export function getVariableName(binddataset: string) {
    let variableName,
        isBoundToVariable;
    const parts = binddataset.split('.');

    isBoundToVariable = _.includes(binddataset, 'Variables.');

    if (isBoundToVariable) {
        variableName = parts[1];
    }
    // TODO: Do it for bind widgets
    return variableName;
}

export function isVariablePaginated(variable) {
    const varCategory = getVariableCategory(variable);

    if (varCategory === VARIABLE_CATEGORY.LIVE || (varCategory === VARIABLE_CATEGORY.SERVICE && variable.controller === 'QueryExecution')) {
        return true;
    }

    return false;
}

export function getVariableCategory(variable) {
    return variable && variable.category;
}

function onSuccess(response, res, rej) {
    if (response.error) {
        rej(response);
    } else {
        res(response);
    }
}


export function performDataOperation(variable, requestData, options): Promise<any> {
    const varCategory = getVariableCategory(variable);

    return new Promise((res, rej) => {
        if (varCategory === VARIABLE_CATEGORY.LIVE) {
            let fn;
            const operationType = options.operationType;
            switch (operationType) {
                case 'update':
                    fn = 'updateRecord';
                    break;
                case 'insert':
                    fn = 'insertRecord';
                    break;
                case 'delete':
                    fn = 'deleteRecord';
                    break;
            }
            variable[fn](requestData, response => onSuccess(response, res, rej), rej);
        } else if (varCategory === VARIABLE_CATEGORY.SERVICE) {
            variable.setInput(requestData);
            variable.update({
                'skipNotification': true
            }, res, rej);
        }
    });
}

export function refreshVariable(variable, options): Promise<any> {
    const varCategory = getVariableCategory(variable);

    return new Promise((res, rej) => {
        if (varCategory === VARIABLE_CATEGORY.LIVE) {
            variable.listRecords({
                // 'filterFields' : filterFields,
                // 'orderBy'      : sortOptions,
                'page': options.page || 1
            }, res, rej);
        }
    });
}

export function getFormVariable(form) {
    return form.parent.Variables[getVariableName(form.binddataset)];
}

export function fetchRelatedFieldData(variable, formField, options) {
    let primaryKeys;
    let displayField;
    const relatedField = options.relatedField;
    const datafield = options.datafield;

    if (!variable) {
        return;
    }
    primaryKeys = variable.getRelatedTablePrimaryKeys(relatedField);
    formField.datafield = datafield;
    formField._primaryKey = _.isEmpty(primaryKeys) ? undefined : primaryKeys[0];
    formField.compareby = primaryKeys && primaryKeys.join(',');

    displayField = datafield === ALLFIELDS ? undefined : datafield;
    formField.displayfield = displayField = (formField.displayfield || displayField || formField._primaryKey);
    // TODO: For autocomplete widget, set the dataset and  related field. Autocomplete widget will make the call to get related data

    variable.getRelatedTableData(relatedField, {
        'pagesize': formField.limit,
        'orderBy': formField.orderby ? _.replace(formField.orderby, /:/g, ' ') : '',
    }, response => {
        formField.dataset = response;
        formField.displayfield = formField.displayfield || _.head(_.keys(_.get(response, '[0]')));
    });
}

function getDistinctFieldProperties(variable, formField) {
    const props: any = {};
    let fieldColumn;
    if (formField['is-related']) {
        props.tableName     = formField.lookupType;
        fieldColumn         = formField.lookupField;
        props.distinctField = fieldColumn;
        props.aliasColumn   = fieldColumn.replace('.', '$'); // For related fields, In response . is replaced by $
    } else {
        props.tableName     = variable.propertiesMap.entityName;
        fieldColumn         = formField.field || formField.key;
        props.distinctField = fieldColumn;
        props.aliasColumn   = fieldColumn;
    }
    return props;
}

function getDistinctValues(variable, formField, widget, callBack) {
    let props;

    if (isDataSetWidget(formField[widget]) && (!formField.isDataSetBound || widget === 'filterwidget')) {
        props = getDistinctFieldProperties(variable, formField);
        variable.getDistinctDataByFields({
            'fields'        : props.distinctField,
            'entityName'    : props.tableName,
            'pagesize'      : formField.limit
        }, data => {
            callBack(formField, data, props.aliasColumn);
        });
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

export function getDistinctValuesForField(variable, formField, options?) {
    if (!variable || getVariableCategory(variable) !== VARIABLE_CATEGORY.LIVE || !formField || formField.isDataSetBound) {
        return;
    }
    // TODO: For autocomplete widget, widget will fetch the data. Set properties on the widget itself. Other widgets, fetch the data.
    getDistinctValues(variable, formField, options.widget, (field, data, aliasColumn) => setFieldDataSet(field, data, {
        aliasColumn: aliasColumn,
        widget: options.widget,
        isEnableEmptyFilter: options.isEnableEmptyFilter
    }));
}