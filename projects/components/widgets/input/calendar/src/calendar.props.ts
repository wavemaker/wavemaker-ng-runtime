import { isMobileApp } from '@wm/core';

import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    const props = new Map(
            [
                ['calendartype', {value: 'basic', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['controls', {value: 'navigation, today, year, month, week, day', ...PROP_STRING}],
                ['dataset', PROP_ANY],
                ['datavalue', PROP_STRING],
                ['eventallday', PROP_STRING],
                ['eventclass', PROP_STRING],
                ['eventend', PROP_STRING],
                ['eventstart', PROP_STRING],
                ['eventtitle', PROP_STRING],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
                ['view', PROP_STRING],
                ['selectionmode', PROP_STRING]
            ]
        );
    if (isMobileApp()) {
        props.set('view', {value: 'day', ...PROP_STRING});
    }
    register('wm-calendar', props);
};
