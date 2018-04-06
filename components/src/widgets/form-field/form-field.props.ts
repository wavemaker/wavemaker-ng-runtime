import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';
import { textProps } from '../text/text.props';
import { searchProps } from '../search/search.props';
import { checkboxProps } from '../checkbox/checkbox.props';
import { colorPickerProps } from '../color-picker/color-picker.props';
import { currencyProps } from '../currency/currency.props';
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
        ['autocomplete', searchProps],
        ['checkbox', checkboxProps],
        // TODO: ['checkboxset', checkboxsetProps],
        // TODO: ['chips', chipsProps],
        ['colorpicker', colorPickerProps],
        ['currency', currencyProps],
        ['date', dateProps],
        ['datetime', dateTimeProps],
        ['number', textProps],
        ['password', textProps],
        ['radioset', radiosetProps],
        ['rating', ratingProps],
        ['richtext', richTextProps],
        ['select', selectProps],
        ['slider', sliderProps],
        ['switch', switchProps],
        ['text', textProps],
        ['textarea', textareaProps],
        ['time', timeProps],
        ['timestamp', dateTimeProps],
        ['toggle', checkboxProps],
        ['typeahead', searchProps],
        // TODO: ['upload', uploadProps]
    ]
);
export const registerProps = (widgetType) => {
    const propsMap = new Map(
        [
            ['displayname', PROP_STRING],
            ['hint', PROP_STRING],
            ['key', PROP_STRING],
            ['name', PROP_STRING],
            ['primary-key', PROP_STRING_NOTIFY],
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
