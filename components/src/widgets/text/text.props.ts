import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../base/framework/widget-props';

export const textProps = new Map(
    [
        ['autocomplete', PROP_BOOLEAN],
        ['autofocus', PROP_BOOLEAN],
        ['class', PROP_STRING],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['maxchars', PROP_NUMBER],
        ['maxvalue', PROP_NUMBER],
        ['minvalue', PROP_NUMBER],
        ['name', PROP_STRING],
        ['placeholder', {value: 'Enter text', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['regexp', PROP_STRING],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', PROP_BOOLEAN],
        ['step', PROP_NUMBER],
        ['tabindex', PROP_NUMBER],
        ['type', PROP_STRING]
    ]
);

export const registerProps = () => {
    register(
        'wm-text',
        textProps
    );
};
