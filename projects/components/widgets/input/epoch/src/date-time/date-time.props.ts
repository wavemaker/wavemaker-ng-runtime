import {FormWidgetType} from '@wm/core';
import {PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register, registerFormWidget} from '@wm/components/base';

export const dateTimeProps = new Map(
    [
        ['autofocus', PROP_BOOLEAN],
        ['class', PROP_STRING],
        ['dataentrymode', { value: 'default', ...PROP_STRING }],
        ['datavaluesource', PROP_ANY],
        ['datavalue', PROP_STRING],
        ['datepattern', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['excludedays', PROP_STRING],
        ['excludedates', PROP_STRING],
        ['hint', PROP_STRING],
        ['arialabel', PROP_STRING],
        ['hourstep', { value: 1, ...PROP_NUMBER }],
        ['maxdate', PROP_STRING],
        ['mindate', PROP_STRING],
        ['minutestep', { value: 15, ...PROP_NUMBER }],
        ['name', PROP_STRING],
        ['outputformat', { value: 'timestamp', ...PROP_STRING }],
        ['placeholder', { value: 'Select date time', ...PROP_STRING }],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['secondsstep', { value: 1, ...PROP_NUMBER }],
        ['shortcutkey', PROP_STRING],
        ['show', { value: true, ...PROP_BOOLEAN }],
        ['showdropdownon', { value: 'default', ...PROP_STRING }],
        ['showbuttonbar', PROP_BOOLEAN],
        ['showcustompicker', { value: false, ...PROP_BOOLEAN }],
        ['showindevice', { displayType: 'inline-block', value: 'all', ...PROP_STRING }],
        ['showweeks', PROP_BOOLEAN],
        ['tabindex', { value: 0, ...PROP_NUMBER }],
        ['timestamp', PROP_STRING],
        ['selectfromothermonth', { value: true, ...PROP_BOOLEAN }],
        ['todaybutton', { value: true, ...PROP_BOOLEAN }],
        ['clearbutton',  { value: true, ...PROP_BOOLEAN }],
        ['adaptiveposition', {value: true, ...PROP_BOOLEAN}],
        ['todaybuttonlabel',  { value: 'LABEL_TODAY_DATE', ...PROP_STRING }],
        ['clearbuttonlabel',  { value: 'LABEL_CLEAR_DATE', ...PROP_STRING }],
        ['showampmbuttons',{ value: false, ...PROP_BOOLEAN }]

    ]
);

export const registerProps = () => {
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
