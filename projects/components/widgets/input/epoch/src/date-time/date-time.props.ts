import { FormWidgetType, isMobileApp } from '@wm/core';
import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register, registerFormWidget } from '@wm/components/base';

export const dateTimeProps = new Map(
    [
        ['autofocus', PROP_BOOLEAN],
        ['class', PROP_STRING],
        ['dataentrymode', {value: 'default', ...PROP_STRING}],
        ['datavaluesource', PROP_ANY],
        ['datavalue', PROP_STRING],
        ['datepattern', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['excludedays', PROP_STRING],
        ['excludedates', PROP_STRING],
        ['hint', PROP_STRING],
        ['hourstep', {value: 1, ...PROP_NUMBER}],
        ['maxdate', PROP_STRING],
        ['mindate', PROP_STRING],
        ['minutestep', {value: 15, ...PROP_NUMBER}],
        ['name', PROP_STRING],
        ['outputformat', {value: 'timestamp', ...PROP_STRING}],
        ['placeholder', {value: 'Select date time', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['secondsstep', {value: 1, ...PROP_NUMBER}],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showdropdownon', {value: 'default', ...PROP_STRING}],
        ['showbuttonbar', PROP_BOOLEAN],
        ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
        ['showweeks', PROP_BOOLEAN],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['timestamp', PROP_STRING]
    ]
);

export const registerProps = () => {
    if (isMobileApp()) {
        dateTimeProps.set('datepattern', {value: 'yyyy-MM-ddTHH:mm:ss', ...PROP_STRING});
    }
    register(
        'wm-datetime',
        dateTimeProps
    );
    registerFormWidget(
        FormWidgetType.DATETIME,
        new Map(dateTimeProps)
    );
    registerFormWidget(
        FormWidgetType.TIMESTAMP,
        new Map(dateTimeProps)
    );
};
