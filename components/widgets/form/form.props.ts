import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

const propsMap = new Map(
    [
        ['autocomplete', {value: true, ...PROP_BOOLEAN}],
        ['captionalign', {value: 'left', ...PROP_STRING_NOTIFY}],
        ['captionposition', {value: 'left', ...PROP_STRING_NOTIFY}],
        ['captionsize', PROP_STRING],
        ['captionwidth', {value: 'xs-12 sm-3 md-3 lg-3', ...PROP_STRING_NOTIFY}],
        ['class', PROP_STRING],
        ['dataset', PROP_STRING],
        ['enctype', PROP_STRING],
        ['errormessage', {value: 'An error occured. Please try again!', ...PROP_STRING}],
        ['formdata', PROP_STRING_NOTIFY],
        ['messagelayout',  {value: 'Inline', ...PROP_STRING}],
        ['iconclass', PROP_STRING],
        ['name', PROP_STRING],
        ['rowdata', PROP_STRING_NOTIFY],
        ['show', PROP_BOOLEAN],
        ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
        ['subheading', PROP_STRING],
        ['tabindex', PROP_NUMBER],
        ['title', PROP_STRING],
        ['validationtype', {value: 'default', ...PROP_STRING}]
    ]
);

const formMap = new Map(propsMap);
formMap.set('action', PROP_STRING);
formMap.set('defaultmode',  {value: 'Edit', ...PROP_STRING_NOTIFY});
formMap.set('metadata',  PROP_STRING);
formMap.set('method',  PROP_STRING);
formMap.set('postmessage',  {value: 'Data posted successfully', ...PROP_STRING});
formMap.set('target',  PROP_STRING);

export const registerFormProps = () => {
    register(
        'wm-form',
        formMap
    );
};

const liveFormMap = new Map(propsMap);
liveFormMap.set('defaultmode',  {value: 'View', ...PROP_STRING_NOTIFY});
liveFormMap.set('rowdata',  PROP_STRING_NOTIFY);

export const registerLiveFormProps = () => {
    register(
        'wm-liveform',
        liveFormMap
    );
};


