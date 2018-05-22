import { isNumberType, FormWidgetType, DataType } from '@wm/core';

declare const _;

const  VIEW_MODE_OPTIONS = {
    'DEFAULT'   : 'default',
    'LABEL'     : 'label'
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
        captionCls = widgetCls = 'col-xs-12';
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
    if (_.includes(['checkbox', 'toggle', 'rating', 'upload'], widget)) {
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
