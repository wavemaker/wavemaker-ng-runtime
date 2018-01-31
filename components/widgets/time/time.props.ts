import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-time',
        new Map(
            [
                ['autofocus', PROP_BOOLEAN],
                ['class', PROP_STRING],
                ['datavalue', PROP_STRING],
                ['disabled', PROP_BOOLEAN],
                ['hourstep', Object.assign({value: 1}, PROP_NUMBER)],
                ['maxtime', PROP_STRING_NOTIFY],
                ['mintime', PROP_STRING_NOTIFY],
                ['minutestep', Object.assign({value: 15}, PROP_NUMBER)],
                ['name', PROP_STRING],
                ['outputformat', Object.assign({value: 'HH:mm:ss'})],
                ['placeholder', Object.assign({value: 'Select time'}, PROP_STRING)],
                ['readonly', PROP_BOOLEAN],
                ['required', PROP_BOOLEAN],
                ['shortcutkey', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['showindevice', Object.assign({displayType: 'inline-block', value: 'all'}, PROP_STRING)],
                ['tabindex', PROP_NUMBER],
                ['timepattern', Object.assign({value: 'hh:mm a'})],
                ['timestamp', PROP_STRING]
            ]
        )
    );
};
