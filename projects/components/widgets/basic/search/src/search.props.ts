import { FormWidgetType } from '@wm/core';
import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register, registerFormWidget } from '@wm/components/base';

export const searchProps = new Map(
    [
        ['casesensitive', {value: false, ...PROP_BOOLEAN}],
        ['class', PROP_STRING],
        ['datacompletemsg', {value: 'No more data to load', ...PROP_STRING}],
        ['datafield', {value: 'All Fields', ...PROP_STRING}],
        ['dataoptions', PROP_ANY],
        ['dataset', PROP_ANY],
        ['datasource', PROP_ANY],
        ['datavalue', PROP_STRING],
        ['datavaluesource', PROP_ANY],
        ['disabled', PROP_BOOLEAN],
        ['displayimagesrc', PROP_STRING],
        ['displaylabel', PROP_STRING],
        ['dropup', PROP_BOOLEAN],
        ['hint', PROP_STRING],
        ['imagewidth', {value: '16px', ...PROP_STRING}],
        ['limit', PROP_NUMBER],
        ['loadingdatamsg', {value: 'Loading items...', ...PROP_STRING}],
        ['matchmode', PROP_STRING],
        ['minchars', PROP_NUMBER],
        ['name', PROP_STRING],
        ['navsearchbar', {value: false, ...PROP_BOOLEAN}],
        ['orderby', PROP_STRING],
        ['placeholder', {value: 'Search', ...PROP_STRING}],
        ['position', PROP_STRING],
        ['query', PROP_STRING],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['searchkey', PROP_STRING],
        ['searchon', {value: 'typing', ...PROP_STRING}],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showsearchicon', PROP_BOOLEAN],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['type', {value: 'search', ...PROP_STRING}],
        ['debouncetime', {value: 250, ...PROP_NUMBER}],
        ['width', PROP_STRING]
    ]
);

export const registerProps = () => {
    register(
        'wm-search',
        searchProps
    );
    registerFormWidget(
        FormWidgetType.AUTOCOMPLETE,
        new Map(searchProps)
    );
    registerFormWidget(
        FormWidgetType.TYPEAHEAD,
        new Map(searchProps)
    );
};
