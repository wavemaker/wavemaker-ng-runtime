
export const EVENTS_MAP = new Map<string, string>([
    //['enterkeypress', 'keypress.enter']
]);


// these attrs should not be set as properties on the component instance
export const ATTR_SKIP_LIST = {
    ngModel: true,
    ngModelOptions: true,
    ngIf: true,
    ngFor: true,
    ngForOf: true
};

// TODO: Implement touch events for the mobile

export const DISPLAY_TYPE = {
    BLOCK: 'block',
    INLINE_BLOCK: 'inline-block',
    INLINE: 'inline'
};