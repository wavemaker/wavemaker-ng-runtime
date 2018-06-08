import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const chipsProps = new Map(
    [
        ['allowonlyselect', PROP_BOOLEAN],
        ['autofocus', PROP_BOOLEAN],
        ['chipclass', PROP_STRING],
        ['class', PROP_STRING],
        ['datafield', {value: 'All Fields', ...PROP_STRING_NOTIFY}],
        ['displayfield', PROP_STRING_NOTIFY],
        ['dataset', {value: 'Option 1, Option 2, Option 3', notify: true}],
        ['datavalue', {notify: true}],
        ['disabled', PROP_BOOLEAN],
        ['displayimagesrc', PROP_STRING],
        ['displaylabel', PROP_STRING_NOTIFY],
        ['enablereorder', PROP_BOOLEAN_NOTIFY],
        ['imagewidth', {value: '16px', ...PROP_STRING}],
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

