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
