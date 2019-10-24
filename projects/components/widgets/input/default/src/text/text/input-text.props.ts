import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register, registerFormWidget } from '@wm/components/base';
import { FormWidgetType } from '@wm/core';


import { inputNumberTypeProps } from '../number/input-number.props';
import { inputCalendarTypeProps } from '../calendar/input-calendar.props';
import { inputColorTypeProps } from '../color/input-color.props';
import { inputEmailTypeProps } from '../email/input-email.props';

export const inputTextTypeProps = new Map(
    [
        ['autocomplete', {value: true, ...PROP_BOOLEAN}],
        ['autofocus', PROP_BOOLEAN],
        ['class', PROP_STRING],
        ['datavaluesource', PROP_ANY],
        ['datavalue', PROP_STRING],
        ['disabled', PROP_BOOLEAN],
        ['displayformat', PROP_STRING],
        ['hint', PROP_STRING],
        ['maxchars', PROP_NUMBER],
        ['name', PROP_STRING],
        ['placeholder', {value: 'Enter text', ...PROP_STRING}],
        ['readonly', PROP_BOOLEAN],
        ['regexp', PROP_STRING],
        ['required', PROP_BOOLEAN],
        ['shortcutkey', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['type', {value: 'text', ...PROP_STRING}],
        ['updateon', PROP_STRING]
    ]
);

export const registerProps = () => {
    register(
        'wm-input-text',
        inputTextTypeProps
    );
    registerFormWidget(
        FormWidgetType.PASSWORD,
        new Map(inputTextTypeProps)
    );
    const formTextProps = new Map(inputTextTypeProps);

    const mergeTextProps = (typeProps) => {
        typeProps.forEach((v: any, k) => formTextProps.set(k, v));
    };
    mergeTextProps(inputCalendarTypeProps);
    mergeTextProps(inputColorTypeProps);
    mergeTextProps(inputEmailTypeProps);
    mergeTextProps(inputNumberTypeProps);
    registerFormWidget(
        FormWidgetType.TEXT,
        new Map(formTextProps)
    );
};
