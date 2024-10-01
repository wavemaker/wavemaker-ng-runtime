import {PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register, registerFormWidget} from '@wm/components/base';
import {FormWidgetType} from '@wm/core';

export const numberProps = new Map(
    [
        ['autofocus', PROP_BOOLEAN],
        ['class', PROP_STRING],
        ['datavaluesource', PROP_ANY],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['hint', PROP_STRING],
        ['arialabel', PROP_STRING],
        ['localefilter', PROP_STRING],
        ['minvalue', PROP_NUMBER],
        ['maxvalue', PROP_NUMBER],
        ['name', PROP_STRING],
        ['numberfilter', PROP_STRING],
        ['placeholder', {value: 'Enter number', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['regexp', PROP_STRING],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['step', {value: 1, ...PROP_NUMBER}],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['trailingzero', {value: false, ...PROP_BOOLEAN}],
        ['updateon', PROP_STRING],
        ['inputmode', {value: 'natural', ...PROP_STRING}],
        ['conditionalclass', PROP_ANY],
        ['conditionalstyle', PROP_ANY]
    ]
);

export const registerProps = () => {
    register(
        'wm-number',
        numberProps
    );
    registerFormWidget(
        FormWidgetType.NUMBER,
        new Map(numberProps)
    );
};
