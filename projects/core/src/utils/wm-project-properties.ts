const properties: any = {};

declare const window;

export function getWmProjectProperties() {
    if (window._WM_APP_PROPERTIES) {
        return window._WM_APP_PROPERTIES;
    } else {
        return properties;
    }
}

export function setWmProjectProperties(props: any) {
    Object.setPrototypeOf(properties, props);
}
