import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-form',
        new Map(
            [
                ['action', PROP_STRING],
                ['autocomplete', {value: true, ...PROP_BOOLEAN}],
                ['captionalign', {value: 'left', ...PROP_STRING_NOTIFY}],
                ['captionposition', {value: 'left', ...PROP_STRING_NOTIFY}],
                ['captionsize', PROP_STRING],
                ['captionwidth', {value: 'xs-12 sm-3 md-3 lg-3', ...PROP_STRING_NOTIFY}],
                ['class', PROP_STRING],
                ['dataset', PROP_STRING],
                ['enctype', PROP_STRING],
                ['errormessage', {value: 'An error occured. Please try again!', ...PROP_STRING}],
                ['formdata', PROP_STRING],
                ['messagelayout',  {value: 'Inline', ...PROP_STRING}],
                ['metadata', PROP_STRING],
                ['method', PROP_STRING],
                ['iconclass', PROP_STRING],
                ['name', PROP_STRING],
                ['postmessage', {value: 'Data posted successfully', ...PROP_STRING}],
                ['show', PROP_BOOLEAN],
                ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
                ['subheading', PROP_STRING],
                ['tabindex', PROP_NUMBER],
                ['target', PROP_STRING],
                ['title', PROP_STRING],
                ['validationtype', {value: 'default', ...PROP_STRING}]
            ]
        )
    );
};