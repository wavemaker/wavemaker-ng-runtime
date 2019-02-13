import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const numberProps = new Map(
    [
        ['autofocus', PROP_BOOLEAN],
        ['class', PROP_STRING],
        ['datavaluesource', PROP_ANY],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['hint', PROP_STRING],
        ['localefilter', PROP_STRING],
        ['minvalue', PROP_NUMBER],
        ['maxvalue', PROP_NUMBER],
        ['name', PROP_STRING],
        ['numberfilter', PROP_STRING],
        ['placeholder', {value: 'Enter number', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['regexp', PROP_STRING],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['step', {value: 1, ...PROP_NUMBER}],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['updateon', PROP_STRING]
    ]
);

export const registerProps = () => {
    register(
        'wm-number',
        numberProps
    );
};
