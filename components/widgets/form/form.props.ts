import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-form',
        new Map(
            [
                ['action', PROP_STRING],
                ['autocomplete', {value: true, ...PROP_BOOLEAN}],
                ['captionalign', PROP_STRING_NOTIFY],
                ['captionposition', PROP_STRING_NOTIFY],
                ['captionsize', PROP_STRING],
                ['captionwidth', PROP_STRING_NOTIFY],
                ['class', PROP_STRING],
                ['dataset', PROP_STRING],
                ['enctype', PROP_STRING],
                ['errormessage', PROP_STRING],
                ['formdata', PROP_STRING],
                ['messagelayout', PROP_STRING],
                ['metadata', PROP_STRING],
                ['method', PROP_STRING],
                ['iconclass', PROP_STRING],
                ['name', PROP_STRING],
                ['postmessage', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
                ['subheading', PROP_STRING],
                ['tabindex', PROP_NUMBER],
                ['target', PROP_STRING],
                ['title', PROP_STRING],
                ['validationtype', PROP_STRING]
            ]
        )
    );
};