import { isMobileApp } from '@wm/core';

import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-list',
        new Map(
            [
                ['boundarylinks', {value: false, ...PROP_BOOLEAN}],
                ['class', PROP_STRING],
                ['collapsible', PROP_BOOLEAN],
                ['dateformat', PROP_STRING],
                ['dataset', PROP_ANY],
                ['datasource', PROP_ANY],
                ['directionlinks', {value: true, ...PROP_BOOLEAN}],
                ['disableitem', PROP_BOOLEAN],
                ['enablereorder', PROP_BOOLEAN],
                ['forceellipses', {value: true, ...PROP_BOOLEAN}],
                ['groupby', PROP_STRING],
                ['iconclass', PROP_STRING],
                ['itemclass', {value: '', ...PROP_STRING}],
                ['itemsperrow', PROP_STRING],
                ['listclass', {value: 'list-group', ...PROP_STRING}],
                ['multiselect', PROP_BOOLEAN],
                ['loadingdatamsg', {value : 'Loading...', ...PROP_STRING}],
                ['loadingicon', {value : 'fa fa-circle-o-notch', ...PROP_STRING}],
                ['match', PROP_STRING],
                ['maxsize', {value: 5, ...PROP_NUMBER}],
                ['name', PROP_STRING],
                ['navigation', PROP_STRING],
                ['navigationalign', {value: 'left', ...PROP_STRING}],
                ['nodatamessage', {value : 'No data found', ...PROP_STRING}],
                ['ondemandmessage', {value : 'Load More', ...PROP_STRING}],
                ['orderby', PROP_STRING],
                ['paginationclass', PROP_STRING],
                ['pagesize', PROP_NUMBER],
                ['pulltorefresh', {value: isMobileApp(), ...PROP_BOOLEAN}],
                ['selectfirstitem', PROP_BOOLEAN],
                ['selectionlimit', PROP_NUMBER],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['showcount', PROP_BOOLEAN],
                ['showrecordcount', PROP_BOOLEAN],
                ['statehandler', {value: 'none', ...PROP_STRING}],
                ['subheading', PROP_STRING],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', PROP_STRING]
            ]
        )
    );
};
