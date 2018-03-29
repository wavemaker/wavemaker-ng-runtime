const widgetProps = new Map<string, Map<string, any>>();

export const getWidgetPropsByType = (widgetType: string): Map<string, any> => {
    return widgetProps.get(widgetType);
};

export const register = (widgetType, props) => {
    widgetProps.set(widgetType, props);
};

export enum PROP_TYPE {
    BOOLEAN = 1,
    NUMBER,
    STRING
}

export const PROP_STRING: any = {};
export const PROP_STRING_NOTIFY: any = {notify: true};
export const PROP_NUMBER: any = {type: PROP_TYPE.NUMBER};
export const PROP_NUMBER_NOTIFY: any = {type: PROP_TYPE.NUMBER, notify: true};
export const PROP_BOOLEAN: any = {type: PROP_TYPE.BOOLEAN, notify: true};
export const PROP_BOOLEAN_NOTIFY: any = {type: PROP_TYPE.BOOLEAN, notify: true};

