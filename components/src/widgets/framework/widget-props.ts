// map of widgetSubType vs WidgetProps
const widgetProps = new Map<string, Map<string, any>>();

// returns the widgetPropsMap associated with the given identifier
export const getWidgetPropsByType = (identifier: string): Map<string, any> => widgetProps.get(identifier);

// register the widgetProps with the given identifier
export const register = (identifier: string, props: Map<string, any>) => widgetProps.set(identifier, props);

export enum PROP_TYPE {
    BOOLEAN = 1,
    NUMBER,
    STRING
}

export const PROP_STRING: any = {type: PROP_TYPE.STRING};
export const PROP_STRING_NOTIFY: any = {type: PROP_TYPE.STRING, notify: true};
export const PROP_NUMBER: any = {type: PROP_TYPE.NUMBER};
export const PROP_NUMBER_NOTIFY: any = {type: PROP_TYPE.NUMBER, notify: true};
export const PROP_BOOLEAN: any = {type: PROP_TYPE.BOOLEAN};
export const PROP_BOOLEAN_NOTIFY: any = {type: PROP_TYPE.BOOLEAN, notify: true};
