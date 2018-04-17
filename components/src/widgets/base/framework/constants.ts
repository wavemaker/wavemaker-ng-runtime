/**
 * default set of events which will be registered on host nativeElement when the callback is present
 * Components can override the behavior by overriding shouldRegisterHostEvent method
 */
export const COMPONENT_HOST_EVENTS = new Set(['click', 'dblclick', 'mouseenter', 'mouseleave', 'mouseout', 'mouseover', 'focus', 'blur', 'keydown', 'keypress', 'keyup']);

// TODO: Implement touch events for the mobile
