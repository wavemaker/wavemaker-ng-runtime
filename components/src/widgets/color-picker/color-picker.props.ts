import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../utils/widget-props';

export const colorPickerProps = new Map(
    [
        ['class', PROP_STRING],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['name', PROP_STRING],
        ['placeholder', {value: 'Select Color', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', PROP_BOOLEAN],
        ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
        ['tabindex', {value: 0, ...PROP_NUMBER}]
    ]
);

export const registerProps = () => {
    register(
        'wm-colorpicker',
        colorPickerProps
    );
};
