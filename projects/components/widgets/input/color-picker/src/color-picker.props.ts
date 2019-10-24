import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register, registerFormWidget } from '@wm/components/base';
import { FormWidgetType } from '@wm/core';

export const colorPickerProps = new Map(
    [
        ['class', PROP_STRING],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['hint', PROP_STRING],
        ['name', PROP_STRING],
        ['placeholder', {value: 'Select Color', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['tabindex', {value: 0, ...PROP_NUMBER}]
    ]
);

export const registerProps = () => {
    register(
        'wm-colorpicker',
        colorPickerProps
    );
    registerFormWidget(
        FormWidgetType.COLORPICKER,
        new Map(colorPickerProps)
    );
};
