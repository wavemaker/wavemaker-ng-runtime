import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const timeProps = new Map(
    [
        ['autofocus', PROP_BOOLEAN],
        ['class', PROP_STRING],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['hourstep', {value: 1, ...PROP_NUMBER}],
        ['maxtime', PROP_STRING],
        ['mintime', PROP_STRING],
        ['minutestep', {value: 15, ...PROP_NUMBER}],
        ['name', PROP_STRING],
        ['outputformat', {value: 'HH:mm:ss', ...PROP_STRING}],
        ['placeholder', {value: 'Select time', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['secondsstep', {value: 1, ...PROP_NUMBER}],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
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
