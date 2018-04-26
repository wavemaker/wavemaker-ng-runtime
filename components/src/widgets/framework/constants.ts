/**
 * default set of events which will be registered on host nativeElement when the callback is present
 * Components can override the behavior by overriding shouldRegisterHostEvent method
 */
export const COMPONENT_HOST_EVENTS = new Set([
    'blur',
    'focus',

    'click',
    'dblclick',

    'keydown',
    'keypress',
    'keyup',

    'mouseenter',
    'mouseleave',
    'mouseout',
    'mouseover',

    'tap',
    'doubletap',
    'pan',
    'swipeup',
    'swipedown',
    'swipeleft',
    'swiperight',
    'pinchin',
    'pinchout'
]);

export const EVENTS_MAP = new Map<string, string>([
    //['enterkeypress', 'keypress.enter']
]);

// TODO: Implement touch events for the mobile

export const DISPLAY_TYPE = {
    BLOCK: 'block',
    INLINE_BLOCK: 'inline-block',
    INLINE: 'inline'
};