import { FormWidgetType } from '@wm/core';

import { PROP_BOOLEAN, PROP_STRING, register } from '../../../framework/widget-props';
import { searchProps } from '../../search/search.props';
import { checkboxProps } from '../../checkbox/checkbox.props';
import { colorPickerProps } from '../../color-picker/color-picker.props';
import { currencyProps } from '../../currency/currency.props';
import { checkboxsetProps } from '../../checkboxset/checkboxset.props';
import { chipsProps } from '../../chips/chips.props';
import { dateProps } from '../../date/date.props';
import { dateTimeProps } from '../../date-time/date-time.props';
import { inputNumberTypeProps } from '../../text/number/input-number.props';
import { inputTextTypeProps } from '../../text/text/input-text.props';
import { radiosetProps } from '../../radioset/radioset.props';
import { ratingProps } from '../../rating/rating.props';
import { richTextProps } from '../../rich-text-editor/rich-text-editor.props';
import { selectProps } from '../../select/select.props';
import { sliderProps } from '../../slider/slider.props';
import { switchProps } from '../../switch/switch.props';
import { textareaProps } from '../../textarea/textarea.props';
import { timeProps } from '../../time/time.props';


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
        [FormWidgetType.DATE, dateProps],
        [FormWidgetType.DATETIME, dateTimeProps],
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
        [FormWidgetType.TIME, timeProps],
        [FormWidgetType.TIMESTAMP, dateTimeProps],
        [FormWidgetType.TOGGLE, checkboxProps],
        [FormWidgetType.TYPEAHEAD, searchProps],
        [FormWidgetType.UPLOAD, uploadProps]
    ]
);
const formFieldMap = new Map(
    [
        ['defaultvalue', PROP_STRING],
        ['displayname', PROP_STRING],
        ['display-name', PROP_STRING],
        ['field', PROP_STRING],
        ['filterexpressions', PROP_STRING],
        ['filter-on', PROP_STRING],
        ['generator', PROP_STRING],
        ['hint', PROP_STRING],
        ['inputtype', PROP_STRING],
        ['is-primary-key', PROP_BOOLEAN],
        ['is-range', PROP_BOOLEAN],
        ['is-related', PROP_BOOLEAN],
        ['isformfield', {value: true}],
        ['key', PROP_STRING],
        ['lookup-type', PROP_STRING],
        ['lookup-field', PROP_STRING],
        ['name', PROP_STRING],
        ['matchmode', PROP_STRING],
        ['maxdefaultvalue', PROP_STRING],
        ['maxplaceholder', PROP_STRING],
        ['mobile-display', {value: true, ...PROP_BOOLEAN}],
        ['period', PROP_BOOLEAN],
        ['pc-display', {value: true, ...PROP_BOOLEAN}],
        ['placeholder', PROP_STRING],
        ['primary-key', PROP_BOOLEAN],
        ['related-entity-name', PROP_STRING],
        ['required', PROP_BOOLEAN],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['type', PROP_STRING],
        ['validationmessage', PROP_STRING],
        ['viewmodewidget', PROP_STRING],
        ['widgettype', PROP_STRING]
    ]
);

export const registerProps = () => {
    widgetPropsMap.forEach((val, key) => {
        const propsMap = new Map(formFieldMap);
        const widgetProps = widgetPropsMap.get(key);
        widgetProps.forEach((v: any, k) => propsMap.set(k, v));
        register(
            'wm-form-field-' + key,
            propsMap
        );
    });
};
