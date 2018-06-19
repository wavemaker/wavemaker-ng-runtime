import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const checkboxProps = new Map(
    [
        ['caption', PROP_STRING],
        ['checkedvalue', {value: true, ...PROP_STRING}],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['hint', PROP_STRING],
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
};
