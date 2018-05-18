import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const currencyProps = new Map(
    [
        ['class', PROP_STRING],
        ['currency', {value: 'USD', ...PROP_STRING_NOTIFY}],
        ['datavalue', PROP_STRING_NOTIFY],
        ['disabled', PROP_BOOLEAN],
        ['hint', PROP_STRING],
        ['maxvalue', PROP_NUMBER],
        ['minvalue', PROP_NUMBER],
        ['name', PROP_STRING],
        ['placeholder', {value: 'Enter value', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['step', PROP_NUMBER],
        ['tabindex', PROP_NUMBER]
    ]
);

export const registerProps = () => {
    register(
        'wm-currency',
        currencyProps
    );
};
