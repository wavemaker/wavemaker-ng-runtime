import { FormWidgetType } from '@wm/core';

import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../../framework/widget-props';
import { searchProps } from '../../search/search.props';
import { checkboxProps } from '../../checkbox/checkbox.props';
import { colorPickerProps } from '../../color-picker/color-picker.props';
import { currencyProps } from '../../currency/currency.props';
import { checkboxsetProps } from '../../checkboxset/checkboxset.props';
import { chipsProps } from '../../chips/chips.props';
import { dateTimeProps } from '../../date-time/date-time.props';
import { inputCalendarTypeProps } from '../../text/calendar/input-calendar.props';
import { inputNumberTypeProps } from '../../text/number/input-number.props';
import { inputTextTypeProps } from '../../text/text/input-text.props';
import { radiosetProps } from '../../radioset/radioset.props';
import { ratingProps } from '../../rating/rating.props';
import { richTextProps } from '../../rich-text-editor/rich-text-editor.props';
import { selectProps } from '../../select/select.props';
import { sliderProps } from '../../slider/slider.props';
import { switchProps } from '../../switch/switch.props';
import { textareaProps } from '../../textarea/textarea.props';


const uploadProps = new Map([
    ['disabled', PROP_BOOLEAN],
    ['extensions', PROP_STRING],
    ['filetype', PROP_STRING],
    ['multiple', PROP_BOOLEAN],
    ['readonly', PROP_BOOLEAN],
    ['required', PROP_BOOLEAN]
]);
const widgetPropsMap = new Map(
[
        [FormWidgetType.AUTOCOMPLETE, searchProps],
        [FormWidgetType.CHECKBOX, checkboxProps],
        [FormWidgetType.CHECKBOXSET, checkboxsetProps],
        [FormWidgetType.CHIPS, chipsProps],
        [FormWidgetType.COLORPICKER, colorPickerProps],
        [FormWidgetType.CURRENCY, currencyProps],
        [FormWidgetType.DATE, inputCalendarTypeProps],
        [FormWidgetType.DATETIME, inputCalendarTypeProps],
        [FormWidgetType.NUMBER, inputNumberTypeProps],
        [FormWidgetType.PASSWORD, inputTextTypeProps],
        [FormWidgetType.RADIOSET, radiosetProps],
        [FormWidgetType.RATING, ratingProps],
        [FormWidgetType.RICHTEXT, richTextProps],
        [FormWidgetType.SELECT, selectProps],
        [FormWidgetType.SLIDER, sliderProps],
        [FormWidgetType.SWITCH, switchProps],
        [FormWidgetType.TEXT, inputTextTypeProps],
        [FormWidgetType.TEXTAREA, textareaProps],
        [FormWidgetType.TIME, inputCalendarTypeProps],
        [FormWidgetType.TIMESTAMP, dateTimeProps],
        [FormWidgetType.TOGGLE, checkboxProps],
        [FormWidgetType.TYPEAHEAD, searchProps],
        [FormWidgetType.UPLOAD, uploadProps]
    ]
);
export const registerProps = (widgetType) => {
    const propsMap = new Map(
        [
            ['defaultvalue', PROP_STRING_NOTIFY],
            ['displayname', PROP_STRING],
            ['display-name', PROP_STRING],
            ['field', PROP_STRING],
            ['hint', PROP_STRING],
            ['is-range', PROP_BOOLEAN],
            ['is-related', PROP_BOOLEAN],
            ['key', PROP_STRING],
            ['lookup-type', PROP_STRING],
            ['lookup-field', PROP_STRING],
            ['name', PROP_STRING],
            ['maxdefaultvalue', PROP_STRING_NOTIFY],
            ['maxplaceholder', PROP_STRING_NOTIFY],
            ['primary-key', PROP_STRING_NOTIFY],
            ['related-entity-name', PROP_STRING],
            ['required', PROP_BOOLEAN],
            ['show', {value: true, ...PROP_BOOLEAN}],
            ['validationmessage', PROP_STRING],
            ['viewmodewidget', PROP_STRING],
            ['widgettype', PROP_STRING]
        ]
    );
    const widgetProps = widgetPropsMap.get(widgetType);
    widgetProps.forEach((v: any, k) => {
        v = {...v};
        v.notify = true;
        propsMap.set(k, v);
    });
    register(
        widgetType,
        propsMap
    );
};
