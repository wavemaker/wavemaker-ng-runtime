import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const timeProps = new Map(
    [
        ['autofocus', PROP_BOOLEAN],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['hourstep', {value: 1, ...PROP_NUMBER}],
        ['maxtime', PROP_STRING_NOTIFY],
        ['mintime', PROP_STRING_NOTIFY],
        ['minutestep', {value: 15, ...PROP_NUMBER}],
        ['name', PROP_STRING],
        ['outputformat', {value: 'HH:mm:ss', ...PROP_STRING}],
        ['placeholder', {value: 'Select time', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['tabindex', PROP_NUMBER],
        ['timepattern', {value: 'hh:mm a', ...PROP_STRING}],
        ['timestamp', PROP_STRING]
    ]
);

export const registerProps = () => {
    register(
        'wm-time',
        timeProps
    );
};
