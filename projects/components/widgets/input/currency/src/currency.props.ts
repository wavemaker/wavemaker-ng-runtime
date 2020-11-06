import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register, registerFormWidget } from '@wm/components/base';
import { FormWidgetType } from '@wm/core';

export const currencyProps = new Map(
    [
        ['class', PROP_STRING],
        ['currency', PROP_STRING],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['hint', PROP_STRING],
        ['maxvalue', PROP_NUMBER],
        ['minvalue', PROP_NUMBER],
        ['name', PROP_STRING],
        ['placeholder', {value: 'Enter value', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['step', {value: 1, ...PROP_NUMBER}],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['trailingzero', {value: false, ...PROP_BOOLEAN}]
    ]
);

export const registerProps = () => {
    register(
        'wm-currency',
        currencyProps
    );
    registerFormWidget(
        FormWidgetType.CURRENCY,
        new Map(currencyProps)
    );
};
