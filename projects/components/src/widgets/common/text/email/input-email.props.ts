import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';

export const inputEmailTypeProps = new Map(
    [
        ['autocomplete', {value: true, ...PROP_BOOLEAN}],
        ['autofocus', PROP_BOOLEAN],
        ['class', PROP_STRING],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['hint', PROP_STRING],
        ['maxchars', PROP_NUMBER],
        ['name', PROP_STRING],
        ['placeholder', {value: 'Enter text', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['regexp', PROP_STRING],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['type', PROP_STRING],
        ['updateon', PROP_STRING]
    ]
);

export const registerProps = () => {
    register(
        'wm-input-email',
        inputEmailTypeProps
    );
};
