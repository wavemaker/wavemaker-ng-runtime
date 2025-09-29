const properties: any = {};
const previewProp: any ={};
declare const window;
declare const _WM_APP_PROPERTIES;

export function getWmProjectProperties() {
    if (window._WM_APP_PROPERTIES) {
        return window._WM_APP_PROPERTIES;
    } else if(typeof _WM_APP_PROPERTIES !== "undefined") {
        return _WM_APP_PROPERTIES;
    } else {
        return properties;
    }
}

export function setWmProjectProperties(props: any) {
    Object.setPrototypeOf(properties, props);
}
export function setPreviewProperties(props: any) {
    Object.assign(previewProp, props);
}
export function getPreviewProperties() {
    const fontConfig = previewProp.fontConfig || '';
    const cssPaths = [...fontConfig.matchAll(/"csspath":\s*"([^"]+)"/g)]
        .map(match => match[1]);

    properties.default = {
        baseFont: '',
        fonts: cssPaths.map(csspath => ({ csspath }))
    };

    return properties;
}
