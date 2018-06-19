import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const radiosetProps = new Map(
    [
        ['class', PROP_STRING],
        ['datafield', PROP_STRING],
        ['dataset', {value: 'Option 1, Option 2, Option 3', ...PROP_ANY}],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['displayexpression', PROP_STRING],
        ['displayfield', PROP_STRING],
        ['itemclass', {value: '', ...PROP_STRING}],
        ['layout', {value: 'stacked', ...PROP_STRING}],
        ['name', PROP_STRING],
        ['orderby', PROP_STRING],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['selectedvalue', PROP_ANY],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
        ['usekeys', PROP_BOOLEAN],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['type', PROP_STRING]
    ]
);

export const registerProps = () => {
    register(
        'wm-radioset',
        radiosetProps
    );
};
