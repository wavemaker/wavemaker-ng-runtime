
export const EVENTS_MAP = new Map<string, string>([
    // ['enterkeypress', 'keypress.enter']
]);


// TODO: Implement touch events for the mobile

export const DISPLAY_TYPE = {
    BLOCK: 'block',
    INLINE_BLOCK: 'inline-block',
    INLINE: 'inline'
};

// set of boolean attrs
const BOOLEAN_ATTRS = new Set([
    'readonly', 'autofocus', 'disabled', 'startchecked', 'multiple',
    'selected', 'required', 'controls', 'autoplay', 'loop', 'muted', 'show'
]);

/**
 * Returns true if the provided key is a boolean attribute
 * @param {string} key
 * @returns {boolean}
 */
export const isBooleanAttr = (key: string): boolean => BOOLEAN_ATTRS.has(key);

const DIMENSION_PROPS = new Set([
    'width',
    'height',
    'iconheight',
    'iconwidth',
    'popoverwidth',
    'popoverheight',
    'imagewidth',
    'imageheight'
]);

export const isDimensionProp = (key: string): boolean => DIMENSION_PROPS.has(key);

export const DEBOUNCE_TIMES = {
    PAGINATION_DEBOUNCE_TIME : 250
};