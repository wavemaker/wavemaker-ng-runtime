import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register, registerFormWidget } from '@wm/components/base';
import { FormWidgetType } from '@wm/core';

export const richTextProps = new Map(
    [
        ['class', PROP_STRING],
        ['datavaluesource', PROP_ANY],
        ['datavalue', PROP_STRING],
        ['height', PROP_STRING],
        ['hint', PROP_STRING],
        ['name', PROP_STRING],
        ['placeholder', PROP_STRING],
        ['readonly', PROP_BOOLEAN],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showpreview', {value: false, ...PROP_BOOLEAN}],
        ['tabindex', {value: 0, ...PROP_NUMBER}]
    ]
);

export const registerProps = () => {
    register(
        'wm-richtexteditor',
        richTextProps
    );
    registerFormWidget(
        FormWidgetType.RICHTEXT,
        new Map(richTextProps)
    );
};
