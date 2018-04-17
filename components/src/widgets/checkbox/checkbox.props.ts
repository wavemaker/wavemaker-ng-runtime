import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../base/framework/widget-props';

export const checkboxProps = new Map(
    [
        ['caption', PROP_STRING],
        ['checkedvalue', PROP_STRING],
        ['color', PROP_STRING],
        ['datavalue', PROP_STRING_NOTIFY],
        ['disabled', PROP_BOOLEAN],
        ['hint', PROP_STRING],
        ['name', PROP_STRING],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', PROP_BOOLEAN],
        ['tabindex', PROP_NUMBER],
        ['type', PROP_STRING_NOTIFY],
        ['uncheckedvalue', PROP_STRING],
    ]
);

export const registerProps = () => {
    register(
        'wm-checkbox',
        checkboxProps
    );
};
