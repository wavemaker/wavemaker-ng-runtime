import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-list',
        new Map(
            [
                ['boundarylinks', {value: false, ...PROP_BOOLEAN}],
                ['class', {...PROP_STRING}],
                ['dataset', {notify: true}],
                ['dateformat', PROP_STRING_NOTIFY],
                ['directionlinks', {value: true, ...PROP_BOOLEAN}],
                ['disableitem', PROP_BOOLEAN_NOTIFY],
                ['enablereorder', PROP_BOOLEAN],
                ['forceellipses', {value: true, ...PROP_BOOLEAN}],
                ['groupby', PROP_STRING_NOTIFY],
                ['iconclass', PROP_STRING],
                ['itemclass', PROP_STRING],
                ['itemsperrow', PROP_STRING],
                ['listclass', PROP_STRING],
                ['multiselect', PROP_BOOLEAN],
                ['loadingdatamsg', {value : 'Loading...', ...PROP_STRING}],
                ['loadingicon', {value : 'fa fa-circle-o-notch', ...PROP_STRING}],
                ['match', PROP_STRING_NOTIFY],
                ['maxsize', {value: 5, ...PROP_NUMBER}],
                ['name', PROP_STRING],
                ['navigation', PROP_STRING_NOTIFY],
                ['navigationalign', {value: 'left', ...PROP_STRING_NOTIFY}],
                ['nodatamessage', {value : 'No data found', ...PROP_STRING}],
                ['ondemandmessage', {value : 'Load More', ...PROP_STRING}],
                ['orderby', PROP_STRING_NOTIFY],
                ['paginationclass', PROP_STRING],
                ['pagesize', PROP_NUMBER],
                ['selectfirstitem', PROP_BOOLEAN],
                ['selectionlimit', PROP_NUMBER],
                ['shortcutkey', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['showcount', PROP_BOOLEAN],
                ['showrecordcount', PROP_BOOLEAN],
                ['subheading', PROP_BOOLEAN],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', PROP_STRING]
            ]
        )
    );
};
