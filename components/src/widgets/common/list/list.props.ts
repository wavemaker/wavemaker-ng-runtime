import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

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
                ['selectfirstitem', PROP_BOOLEAN],
                ['selectionlimit', PROP_NUMBER],
                ['shortcutkey', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['showcount', PROP_BOOLEAN],
                ['showrecordcount', PROP_BOOLEAN],
                ['subheading', PROP_STRING],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', PROP_STRING]
            ]
        )
    );
};
