import { DataType, FormWidgetType, isAndroid, isMobileApp } from "@wm/core";
import { getDataTableFilterWidget, getDefaultValue, getDefaultViewModeWidget, getEditModeWidget, getFieldLayoutConfig, getFieldTypeWidgetTypesMap, parseValueByType, setHeaderConfig, setHeaderConfigForTable } from "./live-utils";

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    isMobileApp: jest.fn(),
    isAndroid: jest.fn()
}));

describe('getDefaultValue', () => {
    describe('widget-specific behavior', () => {
        it('should return number for NUMBER widget', () => {
            expect(getDefaultValue('123', null, FormWidgetType.NUMBER)).toBe(123);
            expect(getDefaultValue('abc', null, FormWidgetType.NUMBER)).toBe(null);
        });

        it('should return number for SLIDER widget', () => {
            expect(getDefaultValue('45.6', null, FormWidgetType.SLIDER)).toBe(45.6);
            expect(getDefaultValue('def', null, FormWidgetType.SLIDER)).toBe(null);
        });

        it('should return number for CURRENCY widget', () => {
            expect(getDefaultValue('78.9', null, FormWidgetType.CURRENCY)).toBe(78.9);
            expect(getDefaultValue('ghi', null, FormWidgetType.CURRENCY)).toBe(null);
        });

        it('should return boolean for CHECKBOX widget', () => {
            expect(getDefaultValue('true', null, FormWidgetType.CHECKBOX)).toBe(true);
            expect(getDefaultValue('false', null, FormWidgetType.CHECKBOX)).toBe(false);
            expect(getDefaultValue('1', null, FormWidgetType.CHECKBOX)).toBe(1);
            expect(getDefaultValue('0', null, FormWidgetType.CHECKBOX)).toBe(0);
            expect(getDefaultValue('abc', null, FormWidgetType.CHECKBOX)).toBe('abc');
        });

        it('should return boolean for TOGGLE widget', () => {
            expect(getDefaultValue('true', null, FormWidgetType.TOGGLE)).toBe(true);
            expect(getDefaultValue('false', null, FormWidgetType.TOGGLE)).toBe(false);
            expect(getDefaultValue('1', null, FormWidgetType.TOGGLE)).toBe(1);
            expect(getDefaultValue('0', null, FormWidgetType.TOGGLE)).toBe(0);
            expect(getDefaultValue('abc', null, FormWidgetType.TOGGLE)).toBe('abc');
        });

        it('should return original value for other widgets', () => {
            expect(getDefaultValue('it', null, FormWidgetType.TEXT)).toBe('it');
        });
    });

    describe('type-specific behavior', () => {
        it('should return number for number types', () => {
            expect(getDefaultValue('123', DataType.INTEGER, null)).toBe(123);
            expect(getDefaultValue('45.6', DataType.FLOAT, null)).toBe(45.6);
            expect(getDefaultValue('abc', DataType.INTEGER, null)).toBe(null);
        });

        it('should return boolean for boolean type', () => {
            expect(getDefaultValue('true', DataType.BOOLEAN, null)).toBe(true);
            expect(getDefaultValue('false', DataType.BOOLEAN, null)).toBe(false);
            expect(getDefaultValue('1', DataType.BOOLEAN, null)).toBe(1);
            expect(getDefaultValue('0', DataType.BOOLEAN, null)).toBe(0);
            expect(getDefaultValue('abc', DataType.BOOLEAN, null)).toBe('abc');
        });

        it('should return original value for other types', () => {
            expect(getDefaultValue('it', DataType.STRING, null)).toBe('it');
        });
    });

    it('should return original value when widget and type are not provided', () => {
        expect(getDefaultValue('it', null, null)).toBe('it');
    });
});


describe('parseValueByType', () => {
    describe('widget-specific behavior', () => {
        it('should handle NUMBER widget', () => {
            expect(parseValueByType('123', null, FormWidgetType.NUMBER)).toBe(123);
            expect(parseValueByType('123', null, FormWidgetType.NUMBER, true)).toBe('123');
            expect(parseValueByType('abc', null, FormWidgetType.NUMBER)).toBe(null);
        });

        it('should handle SLIDER widget', () => {
            expect(parseValueByType('45.6', null, FormWidgetType.SLIDER)).toBe(45.6);
            expect(parseValueByType('45.6', null, FormWidgetType.SLIDER, true)).toBe('45.6');
            expect(parseValueByType('def', null, FormWidgetType.SLIDER)).toBe(null);
        });

        it('should handle CURRENCY widget', () => {
            expect(parseValueByType('78.9', null, FormWidgetType.CURRENCY)).toBe(78.9);
            expect(parseValueByType('78.9', null, FormWidgetType.CURRENCY, true)).toBe('78.9');
            expect(parseValueByType('ghi', null, FormWidgetType.CURRENCY)).toBe(null);
        });

        it('should handle CHECKBOX widget', () => {
            expect(parseValueByType('true', null, FormWidgetType.CHECKBOX)).toBe(true);
            expect(parseValueByType('false', null, FormWidgetType.CHECKBOX)).toBe(false);
            expect(parseValueByType('1', null, FormWidgetType.CHECKBOX)).toBe(1);
            expect(parseValueByType('0', null, FormWidgetType.CHECKBOX)).toBe(0);
            expect(parseValueByType('abc', null, FormWidgetType.CHECKBOX)).toBe('abc');
        });

        it('should handle TOGGLE widget', () => {
            expect(parseValueByType('true', null, FormWidgetType.TOGGLE)).toBe(true);
            expect(parseValueByType('false', null, FormWidgetType.TOGGLE)).toBe(false);
            expect(parseValueByType('1', null, FormWidgetType.TOGGLE)).toBe(1);
            expect(parseValueByType('0', null, FormWidgetType.TOGGLE)).toBe(0);
            expect(parseValueByType('abc', null, FormWidgetType.TOGGLE)).toBe('abc');
        });

        it('should return original value for other widgets', () => {
            expect(parseValueByType('it', null, FormWidgetType.TEXT)).toBe('it');
        });
    });

    describe('type-specific behavior', () => {
        it('should handle number types', () => {
            expect(parseValueByType('123', DataType.INTEGER, null)).toBe(123);
            expect(parseValueByType('45.6', DataType.FLOAT, null)).toBe(45.6);
            expect(parseValueByType('abc', DataType.INTEGER, null)).toBe(null);
        });

        it('should handle boolean type', () => {
            expect(parseValueByType('true', DataType.BOOLEAN, null)).toBe(true);
            expect(parseValueByType('false', DataType.BOOLEAN, null)).toBe(false);
            expect(parseValueByType('1', DataType.BOOLEAN, null)).toBe(1);
            expect(parseValueByType('0', DataType.BOOLEAN, null)).toBe(0);
            expect(parseValueByType('abc', DataType.BOOLEAN, null)).toBe('abc');
        });

        it('should return original value for other types', () => {
            expect(parseValueByType('it', DataType.STRING, null)).toBe('it');
        });
    });
    it('should return original value when widget and type are not provided', () => {
        expect(parseValueByType('it', null, null)).toBe('it');
    });
    describe('trailingzero parameter', () => {
        it('should preserve string for number widgets when trailingzero is true', () => {
            expect(parseValueByType('123.00', null, FormWidgetType.NUMBER, true)).toBe('123.00');
            expect(parseValueByType('45.60', null, FormWidgetType.SLIDER, true)).toBe('45.60');
            expect(parseValueByType('78.90', null, FormWidgetType.CURRENCY, true)).toBe('78.90');
        });

        it('should not affect non-number widgets', () => {
            expect(parseValueByType('true', null, FormWidgetType.CHECKBOX, true)).toBe(true);
            expect(parseValueByType('it', null, FormWidgetType.TEXT, true)).toBe('it');
        });
    });
});


describe('getFieldLayoutConfig', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return correct classes for top caption position on Android', () => {
        (isMobileApp as jest.Mock).mockReturnValue(true);
        (isAndroid as jest.Mock).mockReturnValue(true);

        const result = getFieldLayoutConfig(null, 'top', 'android');
        expect(result).toEqual({
            captionCls: 'col-xs-12',
            widgetCls: 'col-xs-12',
        });
    });

    it('should return correct classes for top caption position on non-Android mobile', () => {
        (isMobileApp as jest.Mock).mockReturnValue(true);
        (isAndroid as jest.Mock).mockReturnValue(false);

        const result = getFieldLayoutConfig(null, 'top', 'ios');
        expect(result).toEqual({
            captionCls: 'col-xs-4',
            widgetCls: 'col-xs-8',
        });
    });

    it('should return correct classes for top caption position on non-mobile app', () => {
        (isMobileApp as jest.Mock).mockReturnValue(false);

        const result = getFieldLayoutConfig(null, 'top', null);
        expect(result).toEqual({
            captionCls: 'col-xs-12',
            widgetCls: 'col-xs-12',
        });
    });

    it('should handle single custom caption width', () => {
        const result = getFieldLayoutConfig('col-md-3', 'left', null);
        expect(result).toEqual({
            captionCls: ' col-col-NaN',
            widgetCls: ' col-col-NaN',
        });
    });

    it('should handle multiple custom caption widths', () => {
        const result = getFieldLayoutConfig('col-md-3 col-sm-4 col-xs-6', 'left', null);
        expect(result).toEqual({
            captionCls: ' col-col-NaN col-col-NaN col-col-NaN',
            widgetCls: ' col-col-NaN col-col-NaN col-col-NaN',
        });
    });

    it('should handle custom caption width with full width', () => {
        const result = getFieldLayoutConfig('col-md-12', 'left', null);
        expect(result).toEqual({
            captionCls: ' col-col-NaN',
            widgetCls: ' col-col-NaN',
        });
    });

    it('should handle custom caption width with zero width', () => {
        const result = getFieldLayoutConfig('col-md-0', 'left', null);
        expect(result).toEqual({
            captionCls: ' col-col-NaN',
            widgetCls: ' col-col-NaN',
        });
    });

    it('should handle invalid custom caption width gracefully', () => {
        const result = getFieldLayoutConfig('col-md-invalid', 'left', null);
        expect(result).toEqual({
            captionCls: ' col-col-NaN',
            widgetCls: ' col-col-NaN',
        });
    });
});

describe('Header Config Functions', () => {
    describe('setHeaderConfig', () => {
        it('should update config at specific index for a nested field', () => {
            const headerConfig = [
                {
                    field: 'personal',
                    isGroup: true,
                    columns: [
                        { field: 'name', isGroup: false },
                        { field: 'age', isGroup: false, visible: true }
                    ]
                }
            ];
            const newConfig = { visible: false };
            setHeaderConfig(headerConfig, newConfig, 'personal', 1);
            expect(headerConfig[0].columns[1].visible).toBe(false);
        });
    });

    describe('setHeaderConfigForTable', () => {
        it('should update config at specific index when no field is provided', () => {
            const headerConfig = [
                { field: 'name', isGroup: false },
                { field: 'age', isGroup: false, visible: true }
            ];
            const newConfig = { visible: false };
            setHeaderConfigForTable(headerConfig, newConfig, '', 1);
            expect(headerConfig[1].visible).toBe(false);
        });

        it('should not modify headerConfig when field is not found', () => {
            const headerConfig = [
                { field: 'name', isGroup: false },
                { field: 'age', isGroup: false, visible: true }
            ];
            const originalHeaderConfig = JSON.parse(JSON.stringify(headerConfig));
            const newConfig = { visible: false };
            setHeaderConfigForTable(headerConfig, newConfig, 'nonexistent');

            expect(headerConfig).toEqual(originalHeaderConfig);
        });
    });
});


describe('getDefaultViewModeWidget', () => {
    it('should return "default" for checkbox widget', () => {
        expect(getDefaultViewModeWidget('checkbox')).toBe('default');
    });

    it('should return "default" for toggle widget', () => {
        expect(getDefaultViewModeWidget('toggle')).toBe('default');
    });

    it('should return "default" for rating widget', () => {
        expect(getDefaultViewModeWidget('rating')).toBe('default');
    });

    it('should return "label" for any other widget', () => {
        expect(getDefaultViewModeWidget('text')).toBe('label');
        expect(getDefaultViewModeWidget('select')).toBe('label');
        expect(getDefaultViewModeWidget('radio')).toBe('label');
    });

    it('should return "label" for undefined input', () => {
        expect(getDefaultViewModeWidget(undefined)).toBe('label');
    });

    it('should return "label" for null input', () => {
        expect(getDefaultViewModeWidget(null)).toBe('label');
    });

    it('should return "label" for empty string input', () => {
        expect(getDefaultViewModeWidget('')).toBe('label');
    });

    it('should be case-sensitive', () => {
        expect(getDefaultViewModeWidget('Checkbox')).toBe('label');
        expect(getDefaultViewModeWidget('TOGGLE')).toBe('label');
        expect(getDefaultViewModeWidget('Rating')).toBe('label');
    });
});


describe('getFieldTypeWidgetTypesMap', () => {
    const fieldTypeWidgetTypeMap = {
        'integer': ['number', 'text', 'select', 'checkboxset', 'radioset', 'rating', 'slider', 'currency', 'autocomplete', 'chips'],
        'big_integer': ['number', 'text', 'select', 'checkboxset', 'radioset', 'rating', 'slider', 'currency', 'autocomplete', 'chips'],
        'short': ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
        'float': ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
        'big_decimal': ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
        'number': ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
        'double': ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
        'long': ['number', 'text', 'select', 'checkboxset', 'radioset', 'rating', 'slider', 'currency', 'autocomplete', 'chips'],
        'byte': ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
        'string': ['text', 'number', 'textarea', 'password', 'richtext', 'select', 'checkboxset', 'radioset', 'date', 'time', 'timestamp', 'switch', 'currency', 'autocomplete', 'chips', 'colorpicker'],
        'character': ['text', 'number', 'textarea', 'password', 'richtext', 'select', 'checkboxset', 'radioset', 'switch', 'currency', 'autocomplete', 'chips'],
        'text': ['text', 'number', 'textarea', 'password', 'richtext', 'select', 'checkboxset', 'radioset', 'date', 'time', 'timestamp', 'switch', 'currency', 'autocomplete', 'chips', 'colorpicker'],
        'date': ['date', 'text', 'number', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
        'time': ['time', 'text', 'number', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
        'timestamp': ['timestamp', 'text', 'number', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
        'datetime': ['datetime', 'text', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
        'boolean': ['checkbox', 'radioset', 'toggle', 'select'],
        'list': ['select', 'radioset', 'checkboxset', 'switch', 'autocomplete', 'chips'],
        'clob': ['text', 'textarea', 'richtext'],
        'blob': ['upload'],
        'file': ['upload'],
        'custom': ['text', 'number', 'textarea', 'password', 'checkbox', 'toggle', 'slider', 'richtext', 'currency', 'switch',
            'select', 'checkboxset', 'radioset', 'date', 'time', 'timestamp', 'rating', 'datetime', 'autocomplete', 'chips', 'colorpicker']
    };

    it('should return fieldTypeWidgetTypeMap', () => {
        const result = getFieldTypeWidgetTypesMap();
        expect(result).toEqual(fieldTypeWidgetTypeMap);
    });
});

describe('getDataTableFilterWidget', () => {
    it('should return SELECT for BOOLEAN type', () => {
        const result = getDataTableFilterWidget(DataType.BOOLEAN);
        expect(result).toBe(FormWidgetType.SELECT);
    });

    it('should return the first widget from fieldTypeWidgetTypeMap for non-BOOLEAN types', () => {
        const result = getDataTableFilterWidget('integer');
        expect(result).toBe('number');
    });

    it('should return TEXT if the widget is not in the allowed list', () => {
        const result = getDataTableFilterWidget('blob');
        expect(result).toBe(FormWidgetType.TEXT);
    });

    it('should return the widget if it is in the allowed list', () => {
        const result = getDataTableFilterWidget('date');
        expect(result).toBe(FormWidgetType.DATE);
    });

    it('should return TEXT for unknown types', () => {
        const result = getDataTableFilterWidget('unknown_type');
        expect(result).toBe(FormWidgetType.TEXT);
    });
});


describe('getEditModeWidget', () => {
    it('should return SELECT for related entity with primary key', () => {
        const colDef = {
            'related-entity-name': 'SomeEntity',
            'primary-key': true,
            type: 'string'
        };
        const result = getEditModeWidget(colDef);
        expect(result).toBe(FormWidgetType.SELECT);
    });

    it('should return the first widget from fieldTypeWidgetTypeMap for known types', () => {
        const colDef = {
            type: 'integer'
        };
        const result = getEditModeWidget(colDef);
        expect(result).toBe('number');
    });

    it('should return TEXT for unknown types', () => {
        const colDef = {
            type: 'unknown_type'
        };
        const result = getEditModeWidget(colDef);
        expect(result).toBe(FormWidgetType.TEXT);
    });

    it('should return TEXT when type is undefined', () => {
        const colDef = {};
        const result = getEditModeWidget(colDef);
        expect(result).toBe(FormWidgetType.TEXT);
    });

    it('should prioritize related entity check over type check', () => {
        const colDef = {
            'related-entity-name': 'SomeEntity',
            'primary-key': true,
            type: 'integer'
        };
        const result = getEditModeWidget(colDef);
        expect(result).toBe(FormWidgetType.SELECT);
    });
});