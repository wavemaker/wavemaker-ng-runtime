import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-datetime',
        new Map(
            [
                ['autofocus', PROP_BOOLEAN],
                ['class', PROP_STRING],
                ['datavalue', PROP_STRING],
                ['datepattern', Object.assign({value: 'YYYY-MM-DD hh:mm:ss a'}, PROP_STRING_NOTIFY)],
                ['disabled', PROP_BOOLEAN],
                ['excludedays', PROP_STRING],
                ['hourstep', Object.assign({value: 1}, PROP_NUMBER)],
                ['ismeridian', Object.assign({value: true}, PROP_BOOLEAN)],
                ['maxdate', PROP_STRING_NOTIFY],
                ['mindate', PROP_STRING_NOTIFY],
                ['minutestep', Object.assign({value: 15}, PROP_NUMBER)],
                ['name', PROP_STRING],
                ['outputformat', Object.assign({value: 'timestamp'}, PROP_STRING_NOTIFY)],
                ['placeholder', Object.assign({value: 'Select date time'}, PROP_STRING)],
                ['readonly', PROP_BOOLEAN],
                ['required', PROP_BOOLEAN],
                ['secondsstep', Object.assign({value: 15}, PROP_NUMBER)],
                ['shortcutkey', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['showbuttonbar', PROP_BOOLEAN],
                ['showindevice', Object.assign({displayType: 'inline-block', value: 'all'}, PROP_STRING)],
                ['showseconds', Object.assign({value: false}, PROP_BOOLEAN)],
                ['showweeks', PROP_BOOLEAN_NOTIFY],
                ['tabindex', PROP_NUMBER],
                ['timepattern', Object.assign({value: 'hh:mm a'})],
                ['timestamp', PROP_STRING]
            ]
        )
    );
};