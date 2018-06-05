import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const searchProps = new Map(
    [
        ['casesensitive', {value: false, ...PROP_BOOLEAN}],
        ['class', PROP_STRING],
        ['datacompletemsg', {value: 'No more data to load', ...PROP_STRING}],
        ['datafield', {value: 'All Fields', ...PROP_STRING_NOTIFY}],
        ['dataset', {notify: true}],
        ['datavalue', PROP_STRING_NOTIFY],
        ['disabled', PROP_BOOLEAN],
        ['displayimagesrc', PROP_STRING_NOTIFY],
        ['displaylabel', PROP_STRING_NOTIFY],
        ['hint', PROP_STRING],
        ['imagewidth', {value: '16px', ...PROP_STRING}],
        ['limit', PROP_NUMBER],
        ['loadingdatamsg', {value: 'Loading items...', ...PROP_STRING}],
        ['name', PROP_STRING],
        ['navsearchbar', {value: false, ...PROP_BOOLEAN}],
        ['orderby', PROP_STRING],
        ['placeholder', {value: 'Search', ...PROP_STRING}],
        ['query', PROP_STRING_NOTIFY],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['searchkey', PROP_STRING],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showsearchicon', PROP_BOOLEAN],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['type', {value: 'search', ...PROP_STRING_NOTIFY}],
        ['width', {value: '100%', ...PROP_STRING}]
    ]
);

export const registerProps = () => {
    register(
        'wm-search',
        searchProps
    );
};
