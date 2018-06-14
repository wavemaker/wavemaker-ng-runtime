import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const textareaProps = new Map(
    [
        ['autofocus', PROP_BOOLEAN],
        ['class', PROP_STRING],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['hint', PROP_STRING],
        ['maxchars', PROP_NUMBER],
        ['name', PROP_STRING],
        ['placeholder', {value: 'Place your text', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['updateon', {value: 'blur', ...PROP_STRING_NOTIFY}]
    ]
);

export const registerProps = () => {
    register(
        'wm-textarea',
        textareaProps
    );
};
