import { PROP_BOOLEAN, PROP_STRING } from '../../framework/widget-props';

export const prefabProps = new Map(
    [
        ['class', {value: '', ...PROP_STRING}],
        ['name', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}]
    ]
);
