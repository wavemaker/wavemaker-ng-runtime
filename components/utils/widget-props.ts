const widgetProps = new Map<string, Map<string, any>>();

export const getWidgetPropsByType = (widgetType: string): Map<string, any> => {
    return widgetProps.get(widgetType);
};

export const register = (widgetType, props) => {
    widgetProps.set(widgetType, props);
};

export enum PROP_TYPE {
    BOOLEAN,
    NUMBER,
    STRING
}

export const PROP_STRING = {};
export const PROP_STRING_NOTIFY = {notify: true};
export const PROP_NUMBER = {type: PROP_TYPE.NUMBER};
export const PROP_NUMBER_NOTIFY = {type: PROP_TYPE.NUMBER, notify: true};
export const PROP_BOOLEAN = {type: PROP_TYPE.BOOLEAN, notify: true};
export const PROP_BOOLEAN_NOTIFY = {type: PROP_TYPE.BOOLEAN, notify: true};

