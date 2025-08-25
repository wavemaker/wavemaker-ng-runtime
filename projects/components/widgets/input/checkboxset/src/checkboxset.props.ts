import { FormWidgetType } from '@wm/core';
import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register, registerFormWidget } from '@wm/components/base';

export const checkboxsetProps = new Map(
    [
        ['class', PROP_STRING],
        ['collapsible', PROP_BOOLEAN],
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
        ['itemclass', {value: '', ...PROP_STRING}],
        ['itemsperrow', {value: 'xs-1 sm-1 md-1 lg-1', ...PROP_STRING}],
        ['listclass', {value: '', ...PROP_STRING}],
        ['match', PROP_STRING],
        ['name', PROP_STRING],
        ['orderby', PROP_STRING],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showcount', PROP_BOOLEAN],
        ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['usekeys', PROP_BOOLEAN]
    ]
);

export const registerProps = () => {
    register(
        'wm-checkboxset',
        checkboxsetProps
    );
    registerFormWidget(
        FormWidgetType.CHECKBOXSET,
        new Map(checkboxsetProps)
    );
};
