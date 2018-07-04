import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const dateProps = new Map(
    [
        ['autofocus', PROP_BOOLEAN],
        ['class', PROP_STRING],
        ['datavalue', PROP_STRING],
        ['datepattern', {value: 'yyyy-MM-dd', ...PROP_STRING}],
        ['disabled', PROP_BOOLEAN],
        ['excludedays', PROP_STRING], // TODO not addressed
        ['excludedates', PROP_STRING], // TODO not addressed
        ['hint', {value: '', ...PROP_STRING}],
        ['maxdate', PROP_STRING],
        ['mindate', PROP_STRING],
        ['name', PROP_STRING],
        ['outputformat', {value: 'yyyy-MM-dd', ...PROP_STRING}],
        ['placeholder', {value: 'Select Date', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING], // TODO not addressed
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showdropdownon', {value: 'default', ...PROP_STRING}],
        ['showbuttonbar', {value: true, ...PROP_BOOLEAN}], // TODO not addressed
        ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
        ['showweeks', {value: false, ...PROP_BOOLEAN}],
        ['tabindex', {value: 0, ...PROP_NUMBER}]
    ]
);

export const registerProps = () => {
    register(
        'wm-date',
        dateProps
    );
};
