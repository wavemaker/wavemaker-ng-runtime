import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const searchProps = new Map(
    [
        ['casesensitive', {value: false, ...PROP_BOOLEAN}],
        ['class', PROP_STRING],
        ['datacompletemsg', PROP_STRING],
        ['datafield', {value: 'All Fields', ...PROP_STRING}],
        ['dataoptions', PROP_ANY],
        ['dataset', PROP_ANY],
        ['datasource', PROP_STRING],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['displayimagesrc', PROP_STRING],
        ['displaylabel', PROP_STRING],
        ['hint', PROP_STRING],
        ['imagewidth', {value: '16px', ...PROP_STRING}],
        ['limit', PROP_NUMBER],
        ['loadingdatamsg', {value: 'Loading items...', ...PROP_STRING}],
        ['minchars', PROP_NUMBER],
        ['name', PROP_STRING],
        ['navsearchbar', {value: false, ...PROP_BOOLEAN}],
        ['orderby', PROP_STRING],
        ['placeholder', {value: 'Search', ...PROP_STRING}],
        ['query', PROP_STRING],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['searchkey', PROP_STRING],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showsearchicon', PROP_BOOLEAN],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['type', {value: 'search', ...PROP_STRING}],
        ['width', {value: '100%', ...PROP_STRING}]
    ]
);

export const registerProps = () => {
    register(
        'wm-search',
        searchProps
    );
};
