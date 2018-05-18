import { register, PROP_STRING_NOTIFY, PROP_STRING, PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER } from '../../framework/widget-props';

export const dateProps = new Map(
    [
        ['autofocus', PROP_BOOLEAN],
        ['class', PROP_STRING],
        ['datavalue', PROP_STRING_NOTIFY],
        ['datepattern', {value: 'yyyy-MM-dd', ...PROP_STRING_NOTIFY}],
        ['disabled', PROP_BOOLEAN_NOTIFY],
        ['excludedays', PROP_STRING], // TODO not addressed
        ['excludedates', PROP_STRING_NOTIFY], // TODO not addressed
        ['hint', {value: '', ...PROP_STRING}],
        ['maxdate', PROP_STRING_NOTIFY],
        ['mindate', PROP_STRING_NOTIFY],
        ['name', PROP_STRING],
        ['outputformat', {value: 'yyyy-MM-dd', ...PROP_STRING_NOTIFY}],
        ['placeholder', {value: 'Select Date', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN_NOTIFY],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING], // TODO not addressed
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showbuttonbar', {value: true, ...PROP_BOOLEAN}], // TODO not addressed
        ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
        ['showweeks', {value: false, ...PROP_BOOLEAN_NOTIFY}],
        ['tabindex', PROP_NUMBER]
    ]
);

export const registerProps = () => {
    register(
        'wm-date',
        dateProps
    );
};
