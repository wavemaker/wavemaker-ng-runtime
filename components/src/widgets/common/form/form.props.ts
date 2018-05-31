import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

const propsMap = new Map(
    [
        ['autocomplete', {value: false, ...PROP_BOOLEAN}],
        ['captionalign', {value: 'left', ...PROP_STRING_NOTIFY}],
        ['captionposition', {value: 'left', ...PROP_STRING_NOTIFY}],
        ['captionsize', PROP_STRING_NOTIFY],
        ['captionwidth', {value: 'xs-12 sm-3 md-3 lg-3', ...PROP_STRING_NOTIFY}],
        ['class', PROP_STRING],
        ['collapsible', PROP_BOOLEAN],
        ['dataset', PROP_STRING],
        ['datasource', PROP_STRING_NOTIFY],
        ['expanded', {value: true, ...PROP_BOOLEAN}],
        ['iconclass', PROP_STRING],
        ['name', PROP_STRING],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
        ['subheading', PROP_STRING],
        ['tabindex', PROP_NUMBER],
        ['title', PROP_STRING]
    ]
);

const formMap = new Map(propsMap);
formMap.set('action', PROP_STRING);
formMap.set('defaultmode', {value: 'Edit', ...PROP_STRING_NOTIFY});
formMap.set('metadata', PROP_STRING);
formMap.set('method', PROP_STRING);
formMap.set('postmessage', {value: 'Data posted successfully', ...PROP_STRING});
formMap.set('target', PROP_STRING);
formMap.set('enctype', PROP_STRING);
formMap.set('errormessage', {value: 'An error occured. Please try again!', ...PROP_STRING});
formMap.set('messagelayout', {value: 'Inline', ...PROP_STRING});
formMap.set('formdata', PROP_STRING_NOTIFY);
formMap.set('novalidate', PROP_BOOLEAN_NOTIFY);
formMap.set('validationtype', {value: 'default', ...PROP_STRING});

export const registerFormProps = () => {
    register(
        'wm-form',
        formMap
    );
};

const liveFormMap = new Map(propsMap);
liveFormMap.set('defaultmode', {value: 'View', ...PROP_STRING_NOTIFY});
liveFormMap.set('formlayout', {value: 'inline', ...PROP_STRING_NOTIFY});
liveFormMap.set('insertmessage', {value: 'Record added successfully', ...PROP_STRING});
liveFormMap.set('updatemessage', {value: 'Record updated successfully', ...PROP_STRING});
liveFormMap.set('deletemessage', {value: 'Record deleted successfully', ...PROP_STRING});
liveFormMap.set('errormessage', {value: 'An error occured. Please try again!', ...PROP_STRING});
liveFormMap.set('messagelayout', {value: 'Inline', ...PROP_STRING});
liveFormMap.set('formdata', PROP_STRING_NOTIFY);
liveFormMap.set('novalidate', PROP_BOOLEAN_NOTIFY);
liveFormMap.set('validationtype', {value: 'default', ...PROP_STRING});

export const registerLiveFormProps = () => {
    register(
        'wm-liveform',
        liveFormMap
    );
};

const liveFilterMap = new Map(propsMap);
liveFilterMap.set('autoupdate', PROP_BOOLEAN);
liveFilterMap.set('enableemptyfilter', {value: ' ', ...PROP_STRING});
liveFilterMap.set('pagesize', {value: 20, ...PROP_NUMBER});

export const registerLiveFilterProps = () => {
    register(
        'wm-livefilter',
        liveFilterMap
    );
};