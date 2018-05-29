import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register, PROP_BOOLEAN_NOTIFY } from '../../framework/widget-props';

export const selectProps = new Map(
    [
        ['autofocus', PROP_BOOLEAN],
        ['class', {value: '', ...PROP_STRING}],
        ['datafield', PROP_STRING_NOTIFY],
        ['dataset', {value: 'Option 1, Option 2, Option 3', notify: true}],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['displayexpression', PROP_STRING_NOTIFY],
        ['displayfield', PROP_STRING_NOTIFY],
        ['hint', PROP_STRING],
        ['multiple', {value: false, ...PROP_BOOLEAN_NOTIFY}],
        ['name', PROP_STRING],
        ['orderby', PROP_STRING_NOTIFY],
        ['placeholder', PROP_STRING],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['usekeys', PROP_BOOLEAN_NOTIFY]
    ]
);

export const registerProps = () => {
    register(
        'wm-select',
        selectProps
    );
};
