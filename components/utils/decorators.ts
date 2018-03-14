export const CUSTOM_EVT_KEY = '_custom_event_handlers';

export function Event(eventName) {
    return function (target, propertyKey, descriptor) {
        const type = target.constructor;
        const meta = type.hasOwnProperty(CUSTOM_EVT_KEY) ?
            type[CUSTOM_EVT_KEY] :
            Object.defineProperty(type, CUSTOM_EVT_KEY, {value: {}})[CUSTOM_EVT_KEY];
        meta[eventName] = descriptor.value;
    }
}