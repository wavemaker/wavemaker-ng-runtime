import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register, registerFormWidget } from '@wm/components/base';
import { FormWidgetType, isMobileApp } from '@wm/core';

export const dateProps = new Map(
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
        ['maxdate', PROP_STRING],
        ['mindate', PROP_STRING],
        ['name', PROP_STRING],
        ['outputformat', { value: 'yyyy-MM-dd', ...PROP_STRING }],
        ['placeholder', { value: 'Select Date', ...PROP_STRING }],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', { value: true, ...PROP_BOOLEAN }],
        ['showdropdownon', { value: 'default', ...PROP_STRING }],
        ['showbuttonbar', { value: true, ...PROP_BOOLEAN }], // TODO not addressed
        ['showindevice', { displayType: 'inline-block', value: 'all', ...PROP_STRING }],
        ['showweeks', { value: false, ...PROP_BOOLEAN }],
        ['tabindex', { value: 0, ...PROP_NUMBER }],
        ['selectfromothermonth', { value: true, ...PROP_BOOLEAN }],
        ['todaybutton',  { value: true, ...PROP_BOOLEAN }],
        ['clearbutton',  { value: true, ...PROP_BOOLEAN }],
        ['todaybuttonlabel',  { value: 'LABEL_TODAY_DATE', ...PROP_STRING }],
        ['clearbuttonlabel',  { value: 'LABEL_CLEAR_DATE', ...PROP_STRING }]

    ]
);

export const registerProps = () => {
    register(
        'wm-date',
        dateProps
    );
    registerFormWidget(
        FormWidgetType.DATE,
        new Map(dateProps)
    );
};
