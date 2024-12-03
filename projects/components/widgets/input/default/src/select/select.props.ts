import {FormWidgetType} from '@wm/core';
import {PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register, registerFormWidget} from '@wm/components/base';

export const selectProps = new Map(
    [
        ['autofocus', PROP_BOOLEAN],
        ['class', {value: '', ...PROP_STRING}],
        ['compareby', PROP_STRING],
        ['datafield', PROP_STRING],
        ['dataset', {value: 'Option 1, Option 2, Option 3', ...PROP_ANY}],
        ['datavaluesource', PROP_ANY],
        ['datavalue', PROP_STRING],
        ['dateformat', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['displayexpression', PROP_STRING],
        ['displayfield', PROP_STRING],
        ['displayValue', PROP_STRING],
        ['groupby', PROP_STRING],
        ['hint', PROP_STRING],
        ['arialabel', PROP_STRING],
        ['match', PROP_STRING],
        ['multiple', {value: false, ...PROP_BOOLEAN}],
        ['name', PROP_STRING],
        ['orderby', PROP_STRING],
        ['placeholder', PROP_STRING],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['usekeys', PROP_BOOLEAN]
    ]
);

export const registerProps = () => {
    register(
        'wm-select',
        selectProps
    );
    registerFormWidget(
        FormWidgetType.SELECT,
        new Map(selectProps)
    );
    registerFormWidget(
        FormWidgetType.TYPEAHEAD,
        new Map(selectProps)
    );
};
