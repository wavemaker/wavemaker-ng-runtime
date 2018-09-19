import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const chipsProps = new Map(
    [
        ['allowonlyselect', PROP_BOOLEAN],
        ['autofocus', PROP_BOOLEAN],
        ['chipclass', PROP_STRING],
        ['class', PROP_STRING],
        ['compareby', PROP_STRING],
        ['datafield', PROP_STRING],
        ['dataoptions', PROP_ANY],
        ['dataset', {value: 'Option 1, Option 2, Option 3', ...PROP_ANY}],
        ['datasource', PROP_STRING],
        ['datavalue', PROP_ANY],
        ['disabled', PROP_BOOLEAN],
        ['displayexpression', PROP_STRING],
        ['displayfield', PROP_STRING],
        ['displayimagesrc', PROP_STRING],
        ['enablereorder', PROP_BOOLEAN],
        ['inputposition', {value: 'last', ...PROP_STRING}],
        ['inputwidth', {value: 'default', ...PROP_STRING}],
        ['limit', PROP_NUMBER],
        ['loadingdatamsg', {value: 'Loading items...', ...PROP_STRING}],
        ['maxsize', PROP_NUMBER],
        ['minchars', {value: 1 , ...PROP_NUMBER}],
        ['name', PROP_STRING],
        ['navsearchbar', {value: false, ...PROP_BOOLEAN}],
        ['orderby', PROP_STRING],
        ['placeholder', {value: 'Type here..', ...PROP_STRING}],
        ['query', PROP_STRING],
        ['readonly', PROP_BOOLEAN],
        ['searchkey', PROP_STRING],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showsearchicon', PROP_BOOLEAN],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['type', {value: 'search', ...PROP_STRING}]
    ]
);

export const registerProps = () => {
    register(
        'wm-chips',
        chipsProps
    );
};

