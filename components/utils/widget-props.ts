const widgetProps = new Map<string, Map<string, any>>();

export const getWidgetPropsByType = (widgetType: string): Map<string, any> => {
    return widgetProps.get(widgetType);
};

export const DEFAULT_PROP_DEF = Object.create(null);
export const DEFAULT_PROP_NOTIFY = {notify: true};

export const register = (widgetType, props) => {
    widgetProps.set(widgetType, props);
};

export enum PROP_TYPE {
    BOOLEAN,
    NUMBER,
    STRING
}
