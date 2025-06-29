import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

const propsMap = new Map(
    [
        ['autocomplete', {value: false, ...PROP_BOOLEAN}],
        ['captionalign', {value: 'left', ...PROP_STRING}],
        ['captionposition', {value: 'left', ...PROP_STRING}],
        ['captionsize', PROP_STRING],
        ['captionwidth', {value: 'xs-12 sm-3 md-3 lg-3', ...PROP_STRING}],
        ['class', PROP_STRING],
        ['collapsible', PROP_BOOLEAN],
        ['dataset', PROP_ANY],
        ['datasource', PROP_STRING],
        ['expanded', {value: true, ...PROP_BOOLEAN}],
        ['formdatasource', PROP_STRING],
        ['name', PROP_STRING],
        ['numberOfFields', PROP_NUMBER],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
        ['subheading', PROP_STRING],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['title', PROP_STRING]
    ]
);


export const registerFormProps = () => {
    const formMap = new Map(propsMap);
    formMap.set('action', PROP_STRING);
    formMap.set('defaultmode', {value: 'Edit', ...PROP_STRING});
    formMap.set('metadata', PROP_STRING);
    formMap.set('method', PROP_STRING);
    formMap.set('postmessage', {value: 'Data posted successfully', ...PROP_STRING});
    formMap.set('target', PROP_STRING);
    formMap.set('enctype', PROP_STRING);
    formMap.set('errormessage', {value: 'An error occured. Please try again!', ...PROP_STRING});
    formMap.set('messagelayout', {value: 'Inline', ...PROP_STRING});
    formMap.set('formdata', PROP_STRING);
    formMap.set('novalidate', PROP_BOOLEAN);
    formMap.set('validationtype', {value: 'default', ...PROP_STRING});
    formMap.set('iconclass', PROP_STRING);
    formMap.set('readonly',{value: false, ...PROP_BOOLEAN});

    register(
        'wm-form',
        formMap
    );
};

export const registerLiveFormProps = () => {
    const liveFormMap = new Map(propsMap);
    liveFormMap.set('defaultmode', {value: 'View', ...PROP_STRING});
    liveFormMap.set('formlayout', {value: 'inline', ...PROP_STRING});
    liveFormMap.set('insertmessage', {value: 'Record added successfully', ...PROP_STRING});
    liveFormMap.set('updatemessage', {value: 'Record updated successfully', ...PROP_STRING});
    liveFormMap.set('deletemessage', {value: 'Record deleted successfully', ...PROP_STRING});
    liveFormMap.set('errormessage', {value: 'An error occured. Please try again!', ...PROP_STRING});
    liveFormMap.set('messagelayout', {value: 'Toaster', ...PROP_STRING});
    liveFormMap.set('formdata', PROP_STRING);
    liveFormMap.set('novalidate', PROP_BOOLEAN);
    liveFormMap.set('validationtype', {value: 'default', ...PROP_STRING});
    liveFormMap.set('iconclass', PROP_STRING);

    register(
        'wm-liveform',
        liveFormMap
    );
};

export const registerLiveFilterProps = () => {
    const liveFilterMap = new Map(propsMap);
    liveFilterMap.set('autoupdate', PROP_BOOLEAN);
    liveFilterMap.set('enableemptyfilter', {value: ' ', ...PROP_STRING});
    liveFilterMap.set('pagesize', {value: 20, ...PROP_NUMBER});
    liveFilterMap.set('iconclass', {value: 'wi wi-filter-list', ...PROP_STRING});

    register(
        'wm-livefilter',
        liveFilterMap
    );
};
