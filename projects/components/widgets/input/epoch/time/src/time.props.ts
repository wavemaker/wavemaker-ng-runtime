import {FormWidgetType} from '@wm/core';

import {PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register, registerFormWidget} from '@wm/components/base';

export const timeProps = new Map(
    [
        ['autofocus', PROP_BOOLEAN],
        ['class', PROP_STRING],
        ['dataentrymode', {value: 'default', ...PROP_STRING}],
        ['datavaluesource', PROP_ANY],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['hint', PROP_STRING],
        ['arialabel', PROP_STRING],
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
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showdropdownon', {value: 'default', ...PROP_STRING}],
        ['showcustompicker', { value: false, ...PROP_BOOLEAN }],
        ['secondsstep', {value: 1, ...PROP_NUMBER}],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['timepattern', PROP_STRING],
        ['timestamp', PROP_STRING]
    ]
);

export const registerProps = () => {
    register(
        'wm-time',
        timeProps
    );
    registerFormWidget(
        FormWidgetType.TIME,
        new Map(timeProps)
    );
};
