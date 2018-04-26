import { FormWidgetType } from '@wm/core';

import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';
import { textProps } from '../text/text.props';
import { searchProps } from '../search/search.props';
import { checkboxProps } from '../checkbox/checkbox.props';
import { colorPickerProps } from '../color-picker/color-picker.props';
import { currencyProps } from '../currency/currency.props';
import { checkboxsetProps } from '../checkboxset/checkboxset.props';
import { dateProps } from '../date/date.props';
import { dateTimeProps } from '../date-time/date-time.props';
import { radiosetProps } from '../radioset/radioset.props';
import { ratingProps } from '../rating/rating.props';
import { richTextProps } from '../rich-text-editor/rich-text-editor.props';
import { selectProps } from '../select/select.props';
import { sliderProps } from '../slider/slider.props';
import { switchProps } from '../switch/switch.props';
import { textareaProps } from '../textarea/textarea.props';
import { timeProps} from '../time/time.props';

const widgetPropsMap = new Map(
[
        [FormWidgetType.AUTOCOMPLETE, searchProps],
        [FormWidgetType.CHECKBOX, checkboxProps],
        [FormWidgetType.CHECKBOXSET, checkboxsetProps],
        // TODO: [FormWidgetType.CHIPS, chipsProps],
        [FormWidgetType.COLORPICKER, colorPickerProps],
        [FormWidgetType.CURRENCY, currencyProps],
        [FormWidgetType.DATE, dateProps],
        [FormWidgetType.DATETIME, dateTimeProps],
        [FormWidgetType.NUMBER, textProps],
        [FormWidgetType.PASSWORD, textProps],
        [FormWidgetType.RADIOSET, radiosetProps],
        [FormWidgetType.RATING, ratingProps],
        [FormWidgetType.RICHTEXT, richTextProps],
        [FormWidgetType.SELECT, selectProps],
        [FormWidgetType.SLIDER, sliderProps],
        [FormWidgetType.SWITCH, switchProps],
        [FormWidgetType.TEXT, textProps],
        [FormWidgetType.TEXTAREA, textareaProps],
        [FormWidgetType.TIME, timeProps],
        [FormWidgetType.TIMESTAMP, dateTimeProps],
        [FormWidgetType.TOGGLE, checkboxProps],
        [FormWidgetType.TYPEAHEAD, searchProps],
        // TODO: [FormWidgetType.UPLOAD, uploadProps]
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
            ['show', PROP_BOOLEAN],
            ['validationmessage', PROP_STRING],
            ['viewmodewidget', PROP_STRING],
            ['widgettype', PROP_STRING]
        ]
    );
    const widgetProps = widgetPropsMap.get(widgetType);
    widgetProps.forEach((v, k) => {
        v.notify = true;
        propsMap.set(k, v);
    });
    register(
        widgetType,
        propsMap
    );
};
