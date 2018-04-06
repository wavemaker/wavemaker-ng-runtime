import { PROP_STRING, PROP_STRING_NOTIFY, register, PROP_NUMBER, PROP_BOOLEAN } from '../../utils/widget-props';

export const searchProps = new Map(
    [
        ['casesensitive', {value: false, ...PROP_BOOLEAN}],
        ['datacompletemsg', {value: 'No more data to load', ...PROP_STRING}],
        ['datafield', {value: 'All Fields', ...PROP_STRING_NOTIFY}],
        ['dataset', PROP_STRING_NOTIFY],
        ['datavalue', PROP_STRING_NOTIFY],
        ['displayimagesrc', PROP_STRING_NOTIFY],
        ['displaylabel', PROP_STRING_NOTIFY],
        ['imagewidth', {value: '16px', ...PROP_STRING}],
        ['limit', PROP_NUMBER],
        ['loadingdatamsg', {value: 'Loading items...', ...PROP_STRING}],
        ['navsearchbar', {value: false, ...PROP_BOOLEAN}],
        ['orderby', PROP_STRING],
        ['placeholder', {value: 'Search', ...PROP_STRING}],
        ['query', PROP_STRING_NOTIFY],
        ['readonly', PROP_BOOLEAN],
        ['scopedataset', PROP_STRING_NOTIFY],
        ['scopedatavalue', PROP_STRING_NOTIFY],
        ['searchkey', PROP_STRING],
        ['shortcutkey', PROP_STRING],
        ['showsearchicon', {value: true, ...PROP_BOOLEAN}],
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
