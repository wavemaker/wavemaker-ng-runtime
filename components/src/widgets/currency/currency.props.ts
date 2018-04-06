import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const currencyProps = new Map(
    [
        ['class', PROP_STRING],
        ['currency', {value: 'USD', ...PROP_STRING}],
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
        ['show', PROP_BOOLEAN],
        ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
        ['step', PROP_NUMBER],
        ['tabindex', PROP_NUMBER],
        ['target', PROP_STRING]
    ]
);

export const registerProps = () => {
    register(
        'wm-currency',
        currencyProps
    );
};
