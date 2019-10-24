import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register, registerFormWidget } from '@wm/components/base';
import { FormWidgetType } from '@wm/core';

export const switchProps = new Map(
    [
        ['class', PROP_STRING],
        ['compareby', PROP_STRING],
        ['datafield', PROP_STRING],
        ['dataset', {value: 'yes, no, maybe', ...PROP_ANY}],
        ['datavaluesource', PROP_ANY],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['displayexpression', PROP_STRING],
        ['displayfield', PROP_STRING],
        ['hint', PROP_STRING],
        ['iconclass', PROP_STRING],
        ['name', PROP_STRING],
        ['orderby', PROP_STRING],
        ['required', PROP_BOOLEAN],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['tabindex', {value: 0, ...PROP_NUMBER}]
    ]
);


export const registerProps = () => {
    register(
        'wm-switch',
        switchProps
    );
    registerFormWidget(
        FormWidgetType.SWITCH,
        new Map(switchProps)
    );
    registerFormWidget(
        FormWidgetType.TOGGLE,
        new Map(switchProps)
    );
};
