import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, PROP_NUMBER, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-calendar',
        new Map(
            [
                ['calendartype', {value: 'basic', ...PROP_STRING_NOTIFY}],
                ['class', PROP_STRING],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['controls', {value: 'navigation, today, year, month, week, day', ...PROP_STRING}],
                ['dataset', PROP_STRING_NOTIFY],
                ['datavalue', PROP_STRING],
                ['eventallday', PROP_STRING],
                ['eventclass', PROP_STRING],
                ['eventend', PROP_STRING],
                ['eventstart', PROP_STRING],
                ['eventtitle', PROP_STRING],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
                ['view', PROP_STRING_NOTIFY],
                ['selectionmode', PROP_STRING_NOTIFY]
            ]
        )
    );
};
