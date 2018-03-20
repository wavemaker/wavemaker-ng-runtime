declare const _;

// Method to set the header config of the data table
export const setHeaderConfig = (headerConfig, config, field): void => {
    _.forEach(headerConfig, (cols) => {
        if (cols.isGroup) {
            if (cols.field === field) {
                cols.columns.push(config);
            } else {
                this.setHeaderConfig(cols.columns, config, field);
            }
        }
    });
};

export const setHeaderConfigForTable = (headerConfig, config, fieldName): void => {
    if (fieldName) {
        this.setHeaderConfig(headerConfig, config, fieldName);
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
