import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-datetime',
        new Map(
            [
                ['autofocus', PROP_BOOLEAN],
                ['class', PROP_STRING],
                ['datavalue', PROP_STRING],
                ['datepattern', {value: 'YYYY-MM-DD hh:mm:ss a', ...PROP_STRING_NOTIFY}],
                ['disabled', PROP_BOOLEAN],
                ['excludedays', PROP_STRING],
                ['hourstep', {value: 1, ...PROP_NUMBER}],
                ['ismeridian', {value: true, ...PROP_BOOLEAN}],
                ['maxdate', PROP_STRING_NOTIFY],
                ['mindate', PROP_STRING_NOTIFY],
                ['minutestep', {value: 15, ...PROP_NUMBER}],
                ['name', PROP_STRING],
                ['outputformat', {value: 'timestamp', ...PROP_STRING_NOTIFY}],
                ['placeholder', {value: 'Select date time', ...PROP_STRING}],
                ['readonly', PROP_BOOLEAN],
                ['required', PROP_BOOLEAN],
                ['secondsstep', {value: 15, ...PROP_NUMBER}],
                ['shortcutkey', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['showbuttonbar', PROP_BOOLEAN],
                ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
                ['showseconds', {value: false, ...PROP_BOOLEAN}],
                ['showweeks', PROP_BOOLEAN_NOTIFY],
                ['tabindex', PROP_NUMBER],
                ['timepattern', {value: 'hh:mm a', ...PROP_STRING}],
                ['timestamp', PROP_STRING]
            ]
        )
    );
};