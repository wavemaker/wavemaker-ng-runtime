import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register, PROP_BOOLEAN_NOTIFY } from '../../framework/widget-props';

export const selectProps = new Map(
    [
        ['autofocus', PROP_BOOLEAN],
        ['class', {value: '', ...PROP_STRING}],
        ['datafield', PROP_STRING_NOTIFY],
        ['dataset', PROP_STRING_NOTIFY],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['displayexpression', PROP_STRING_NOTIFY],
        ['displayfield', PROP_STRING_NOTIFY],
        ['hint', PROP_STRING],
        ['multiple', PROP_BOOLEAN_NOTIFY],
        ['name', PROP_STRING],
        ['placeholder', {value: 'Enter text', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', PROP_BOOLEAN],
        ['tabindex', PROP_NUMBER],
        ['usekeys', PROP_BOOLEAN_NOTIFY]
    ]
);

export const registerProps = () => {
    register(
        'wm-select',
        selectProps
    );
};
