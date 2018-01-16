export const isDefined = v => 'undefined' !== typeof v;

export const isObject = v => null !== v && 'object' === typeof v;

export const debounce = (fn: Function, wait: number = 50) => {
    let timeout;
    return (...args) => {
        window['__zone_symbol__clearTimeout'](timeout);
        timeout = window['__zone_symbol__setTimeout'](() => fn(...args), wait);
    };
};

export const encodeUrl = url => {
    /*todo implement */

    return url;
};

export function* idMaker(token) {
    let id = 1;
    while (1) {
        yield `${token}${id++}`;
    }
}
