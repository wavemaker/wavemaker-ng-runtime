import {FormWidgetType} from '@wm/core';
import {PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register, registerFormWidget} from '@wm/components/base';

export const checkboxProps = new Map(
    [
        ['caption', PROP_STRING],
        ['class', PROP_STRING],
        ['conditionalclass', PROP_ANY],
        ['conditionalstyle', PROP_ANY],
        ['checkedvalue', {value: true, ...PROP_STRING}],
        ['datavaluesource', PROP_ANY],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['hint', PROP_STRING],
        ['arialabel', PROP_STRING],
        ['name', PROP_STRING],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['uncheckedvalue', {value: false, ...PROP_STRING}]
    ]
);

export const registerProps = () => {
    register(
        'wm-checkbox',
        checkboxProps
    );
    registerFormWidget(
        FormWidgetType.CHECKBOX,
        checkboxProps
    );
    registerFormWidget(
        FormWidgetType.TOGGLE,
        checkboxProps
    );
};
