import { register, PROP_STRING_NOTIFY, PROP_STRING, PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-date',
        new Map(
            [
                ['autofocus', PROP_BOOLEAN],
                ['class', PROP_STRING],
                ['datavalue', PROP_STRING_NOTIFY],
                ['datepattern', PROP_STRING_NOTIFY],
                ['disabled', PROP_BOOLEAN_NOTIFY],
                ['excludedays', PROP_STRING],
                ['hint', {value: '', ...PROP_STRING}],
                ['maxdate', PROP_STRING_NOTIFY],
                ['mindate', PROP_STRING_NOTIFY],
                ['name', PROP_STRING],
                ['outputformat', PROP_STRING_NOTIFY],
                ['placeholder', {value: 'Select Date', ...PROP_STRING}],
                ['readonly', PROP_BOOLEAN_NOTIFY],
                ['shortcutkey', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['showbuttonbar', PROP_BOOLEAN],
                ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
                ['showweeks', PROP_BOOLEAN_NOTIFY],
                ['tabindex', PROP_NUMBER]
            ]
        )
    );
};
