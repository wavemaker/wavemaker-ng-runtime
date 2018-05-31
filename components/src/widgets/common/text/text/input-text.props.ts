import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../../framework/widget-props';

export const inputTextTypeProps = new Map(
    [
        ['autocomplete', {value: true, ...PROP_BOOLEAN}],
        ['autofocus', PROP_BOOLEAN],
        ['class', PROP_STRING],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['displayformat', PROP_STRING],
        ['hint', PROP_STRING],
        ['maxchars', PROP_NUMBER],
        ['name', PROP_STRING],
        ['placeholder', {value: 'Enter text', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['regexp', PROP_STRING],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['step', PROP_NUMBER],
        ['tabindex', PROP_NUMBER],
        ['type', {value: 'text', ...PROP_STRING}],
        ['updateon', {value: 'blur', ...PROP_STRING_NOTIFY}]
    ]
);

export const registerProps = () => {
    register(
        'wm-input-text',
        inputTextTypeProps
    );
};
