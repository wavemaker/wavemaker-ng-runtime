import {DataType, FormWidgetType} from '@wm/core';

export const ALLFIELDS = 'All Fields';
export const EDIT_MODE = {
    QUICK_EDIT : 'quickedit',
    INLINE : 'inline',
    FORM : 'form',
    DIALOG : 'dialog'
};

const fieldTypeWidgetTypeMap = {
    'integer'    : ['number', 'text', 'select', 'checkboxset', 'radioset', 'rating', 'slider', 'currency', 'autocomplete', 'chips'],
    'big_integer': ['number', 'text', 'select', 'checkboxset', 'radioset', 'rating', 'slider', 'currency', 'autocomplete', 'chips'],
    'short'      : ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
    'float'      : ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
    'big_decimal': ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
    'number'     : ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
    'double'     : ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
    'long'       : ['number', 'text', 'select', 'checkboxset', 'radioset', 'rating', 'slider', 'currency', 'autocomplete', 'chips'],
    'byte'       : ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
    'string'     : ['text', 'number',  'textarea', 'password', 'richtext', 'select', 'checkboxset', 'radioset', 'date', 'time', 'timestamp', 'switch', 'currency', 'autocomplete', 'chips', 'colorpicker'],
    'character'  : ['text', 'number',  'textarea', 'password', 'richtext', 'select', 'checkboxset', 'radioset', 'switch', 'currency', 'autocomplete', 'chips'],
    'text'       : ['text', 'number',  'textarea', 'password', 'richtext', 'select', 'checkboxset', 'radioset', 'date', 'time', 'timestamp', 'switch', 'currency', 'autocomplete', 'chips', 'colorpicker'],
    'date'       : ['date', 'text', 'number', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
    'time'       : ['time', 'text', 'number', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
    'timestamp'  : ['timestamp', 'text', 'number', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
    'datetime'   : ['datetime', 'text', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
    'boolean'    : ['checkbox', 'radioset', 'toggle', 'select'],
    'list'       : ['select', 'radioset', 'checkboxset', 'switch', 'autocomplete', 'chips'],
    'clob'       : ['text', 'textarea', 'richtext'],
    'blob'       : ['upload'],
    'file'       : ['upload'],
    'custom'     : ['text', 'number',  'textarea', 'password', 'checkbox', 'toggle', 'slider', 'richtext', 'currency', 'switch',
        'select', 'checkboxset', 'radioset', 'date', 'time', 'timestamp', 'rating', 'datetime', 'autocomplete', 'chips', 'colorpicker']
};

const DATASET_WIDGETS = new Set([FormWidgetType.SELECT, FormWidgetType.CHECKBOXSET, FormWidgetType.RADIOSET,
    FormWidgetType.SWITCH, FormWidgetType.AUTOCOMPLETE, FormWidgetType.CHIPS, FormWidgetType.TYPEAHEAD, FormWidgetType.RATING]);

export const isDataSetWidget = widget => {
    return DATASET_WIDGETS.has(widget);
};

// Get filter widget applicable to the given type
export const getDataTableFilterWidget = type => {
    let widget = fieldTypeWidgetTypeMap[type] && fieldTypeWidgetTypeMap[type][0];
    if (type === DataType.BOOLEAN) {
        widget = FormWidgetType.SELECT;
    }
    const filterWidgets = [FormWidgetType.TEXT, FormWidgetType.NUMBER, FormWidgetType.SELECT, FormWidgetType.AUTOCOMPLETE,
        FormWidgetType.DATE, FormWidgetType.TIME, FormWidgetType.DATETIME];
    if (filterWidgets.includes(widget)) {
        return widget;
    }
    return FormWidgetType.TEXT;
};

/**
 * @ngdoc function
 * @name wm.widgets.live.getEditModeWidget
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * This function returns the default widget for grid
 *
 * @param {object} colDef field definition
 */
export const getEditModeWidget = colDef => {
    if (colDef['related-entity-name'] && colDef['primary-key']) {
        return FormWidgetType.SELECT;
    }
    return (fieldTypeWidgetTypeMap[colDef.type] && fieldTypeWidgetTypeMap[colDef.type][0]) || FormWidgetType.TEXT;
};
