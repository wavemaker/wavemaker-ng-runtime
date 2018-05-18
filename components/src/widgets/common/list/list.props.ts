import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-list',
        new Map(
            [
                ['boundarylinks', {value: false, ...PROP_BOOLEAN}],
                ['class', {...PROP_STRING}],
                ['datasource', PROP_STRING_NOTIFY],
                ['dataset', PROP_STRING_NOTIFY],
                ['directionlinks', {value: true, ...PROP_BOOLEAN}],
                ['disableitem', PROP_BOOLEAN_NOTIFY],
                ['enablereorder', PROP_BOOLEAN],
                ['forceellipses', {value: true, ...PROP_BOOLEAN}],
                ['itemclass', PROP_STRING_NOTIFY],
                ['listclass', PROP_STRING_NOTIFY],
                ['multiselect', PROP_BOOLEAN],
                ['loadingdatamsg', PROP_STRING_NOTIFY],
                ['maxsize', {value: 5, ...PROP_NUMBER_NOTIFY}],
                ['name', PROP_STRING],
                ['navigation', PROP_STRING_NOTIFY],
                ['navigationalign', {value: 'left', ...PROP_STRING_NOTIFY}],
                ['ondemandmessage', PROP_STRING_NOTIFY],
                ['paginationclass', PROP_STRING_NOTIFY],
                ['selectfirstitem', PROP_BOOLEAN_NOTIFY],
                ['selectionlimit', PROP_NUMBER_NOTIFY],
                ['shortcutkey', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['showrecordcount', PROP_BOOLEAN],
                ['subheading', PROP_BOOLEAN],
                ['title', PROP_STRING]
            ]
        )
    );
};

