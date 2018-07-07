import { isNumberType, FormWidgetType, DataType, isMobileApp, isAndroid } from '@wm/core';

declare const _;

const  VIEW_MODE_OPTIONS = {
    DEFAULT : 'default',
    LABEL : 'label'
};

export const EDIT_MODE = {
    QUICK_EDIT : 'quickedit',
    INLINE : 'inline',
    FORM : 'form',
    DIALOG : 'dialog'
};

// Method to set the header config of the data table
export const setHeaderConfig = (headerConfig, config, field): void => {
    _.forEach(headerConfig, cols => {
        if (cols.isGroup) {
            if (cols.field === field) {
                cols.columns.push(config);
            } else {
                setHeaderConfig(cols.columns, config, field);
            }
        }
    });
};

export const setHeaderConfigForTable = (headerConfig, config, fieldName): void => {
    if (fieldName) {
        setHeaderConfig(headerConfig, config, fieldName);
    } else {
        headerConfig.push(config);
    }
};

export const getRowOperationsColumn = (): any => {
    return {
        'field'         : 'rowOperations',
        'type'          : 'custom',
        'displayName'   : 'Actions',
        'width'         : '120px',
        'readonly'      : true,
        'sortable'      : false,
        'searchable'    : false,
        'resizable'     : false,
        'selectable'    : false,
        'show'          : true,
        'operations'    : [],
        'opConfig'      : {},
        'pcDisplay'     : true,
        'mobileDisplay' : true,
        'include'       : true,
        'isRowOperation': true
    };
};

/**
 * Returns caption and widget bootstrap classes for the field
 */
export const getFieldLayoutConfig = (captionWidth, captionPosition): any => {
    let captionCls = '',
        widgetCls = '';

    captionPosition = captionPosition || 'top';

    if (captionPosition === 'top') {
        // TODO: check for selectedViewPort android
        if (!isMobileApp() || isAndroid()) { // Is android or not a mobile application
            captionCls = widgetCls = 'col-xs-12';
        } else if (isMobileApp()) { // Is a mobile application and not android
            captionCls = 'col-xs-4';
            widgetCls = 'col-xs-8';
        }
    } else if (captionWidth) {
        // handling itemsperrow containing string of classes
        _.forEach(_.split(captionWidth, ' '), function (cls) {
            const keys = _.split(cls, '-'),
                tier = keys[0];
            let _captionWidth,
                widgetWidth;
            _captionWidth = parseInt(keys[1], 10);
            widgetWidth  = 12 - _captionWidth;
            widgetWidth  = widgetWidth <= 0 ? 12 : widgetWidth;
            captionCls += ' ' + 'col-' + tier + '-' + _captionWidth;
            widgetCls  += ' ' + 'col-' + tier + '-' + widgetWidth;
        });
    }
    return {
        'captionCls' : captionCls,
        'widgetCls'  : widgetCls
    };
};

export const getDefaultViewModeWidget = widget => {
    if (_.includes(['checkbox', 'toggle', 'rating'], widget)) {
        return VIEW_MODE_OPTIONS.DEFAULT;
    }
    return VIEW_MODE_OPTIONS.LABEL;
};

const parseBooleanValue = value => {
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    if (/^\d+$/.test(value)) { // Check if the value is a string of number type like '123'
        return +value;
    }
    return value;
};

export const parseValueByType = (value, type, widget) => {
    if (widget) {
        if (widget === FormWidgetType.NUMBER || widget === FormWidgetType.SLIDER || widget === FormWidgetType.CURRENCY) {
            return isNaN(Number(value)) ? null : Number(value);
        }
        if (widget === FormWidgetType.CHECKBOX || widget === FormWidgetType.TOGGLE) {
            return parseBooleanValue(value);
        }
        return value;
    }
    if (isNumberType(type)) {
        return isNaN(Number(value)) ? null : Number(value);
    }
    if (type === DataType.BOOLEAN) {
        return parseBooleanValue(value);
    }
    return value;
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

// Get widgets applicable to the given type
export const getFieldTypeWidgetTypesMap = () => {
    return fieldTypeWidgetTypeMap;
};

// Get filter widget applicable to the given type
export const getDataTableFilterWidget = type => {
    let widget = fieldTypeWidgetTypeMap[type] && fieldTypeWidgetTypeMap[type][0];
    if (type === DataType.BOOLEAN) {
        widget = FormWidgetType.SELECT;
    }
    if (_.includes([FormWidgetType.TEXT, FormWidgetType.NUMBER, FormWidgetType.SELECT, FormWidgetType.AUTOCOMPLETE,
            FormWidgetType.DATE, FormWidgetType.TIME, FormWidgetType.DATETIME], widget)) {
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

/**
 * @ngdoc function
 * @name wm.widgets.live.LiveWidgetUtils#formatBooleanValue
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * return the formatted boolean value
 *
 * @param {string} value value to be formatted
 */
const formatBooleanValue = value => {
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    if (/^\d+$/.test(value)) { // Check if the value is a string of number type like '123'
        return +value;
    }
    return value;
};

/**
 * @ngdoc function
 * @name wm.widgets.live.LiveWidgetUtils#getDefaultValue
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * return the formatted default value
 *
 * @param {string} value value to be formatted
 * @param {string} type column type of the value
 */
export const getDefaultValue = (value, type, widget) => {
    if (widget) {
        if (widget === FormWidgetType.NUMBER || widget === FormWidgetType.SLIDER || widget === FormWidgetType.CURRENCY) {
            return isNaN(Number(value)) ? null : Number(value);
        }
        if (widget === FormWidgetType.CHECKBOX || widget === FormWidgetType.TOGGLE) {
            return formatBooleanValue(value);
        }
        return value;
    }
    if (isNumberType(type)) {
        return isNaN(Number(value)) ? null : Number(value);
    }
    if (type === DataType.BOOLEAN) {
        return formatBooleanValue(value);
    }
    return value;
};
