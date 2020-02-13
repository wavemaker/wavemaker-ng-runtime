import { PROP_BOOLEAN, PROP_STRING } from '@wm/components/base'; 

export const prefabProps = new Map(
    [
        ['animation', PROP_STRING],
        ['class', {value: '', ...PROP_STRING}],
        ['name', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}]
    ]
);
