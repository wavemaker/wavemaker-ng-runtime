import { FormWidgetType } from '@wm/core';

declare const window;
const formFieldPrefix = 'wm-form-field-';
// map of widgetSubType vs WidgetProps
const widgetProps = (() => {
    const props = new Map<string, Map<string, any>>();
    for (const key in FormWidgetType) {
        props.set(formFieldPrefix + FormWidgetType[key], new Map<string, any>());
    }
    return props;
})();

// returns the widgetPropsMap associated with the given identifier
export const getWidgetPropsByType = (identifier: string): Map<string, any> => widgetProps.get(identifier);

// register the widgetProps with the given identifier
export const register = (identifier: string, props: Map<string, any>) => {
    widgetProps.set(identifier, props);
    window.WM_LOADED_COMPONENTS = [...window.WM_LOADED_COMPONENTS || [], identifier ];
};

export const registerFormWidget = (identifier: string, props: Map<string, any>) => {
    const widgetName = formFieldPrefix + identifier;
    const existingProps = widgetProps.get(widgetName);
    if (existingProps) {
        props.forEach((v: any, k) => existingProps.set(k, v));
    }
};

export enum PROP_TYPE {
    BOOLEAN = 1,
    NUMBER,
    STRING
}

export const PROP_STRING: any = {type: PROP_TYPE.STRING};
export const PROP_NUMBER: any = {type: PROP_TYPE.NUMBER};
export const PROP_BOOLEAN: any = {type: PROP_TYPE.BOOLEAN};
export const PROP_ANY: any = {};
