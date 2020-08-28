import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const inputNumberTypeProps = new Map(
    [
        ['autocomplete', {value: true, ...PROP_BOOLEAN}],
        ['autofocus', PROP_BOOLEAN],
        ['autotrim', {value: true, ...PROP_BOOLEAN}],
        ['class', PROP_STRING],
        ['datavaluesource', PROP_ANY],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['hint', PROP_STRING],
        ['maxchars', PROP_NUMBER],
        ['maxvalue', PROP_NUMBER],
        ['minvalue', PROP_NUMBER],
        ['name', PROP_STRING],
        ['placeholder', {value: 'Enter text', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['regexp', PROP_STRING],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['step', PROP_NUMBER],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['type', PROP_STRING],
        ['updateon', PROP_STRING]
    ]
);

export const registerProps = () => {
    register(
        'wm-input-number',
        inputNumberTypeProps
    );
};
