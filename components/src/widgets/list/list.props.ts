import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../base/framework/widget-props';

export const registerProps = () => {
    register(
        'wm-list',
        new Map(
            [
                ['class', {...PROP_STRING}],
                ['dataset', PROP_STRING_NOTIFY],
                ['disableitem', PROP_BOOLEAN_NOTIFY],
                ['enablereorder', PROP_BOOLEAN],
                ['itemclass', PROP_STRING_NOTIFY],
                ['listclass', PROP_STRING_NOTIFY],
                ['multiselect', PROP_BOOLEAN],
                ['loadingdatamsg', PROP_STRING_NOTIFY],
                ['name', PROP_STRING],
                ['navigation', PROP_STRING_NOTIFY],
                ['ondemandmessage', PROP_STRING_NOTIFY],
                ['paginationclass', PROP_STRING_NOTIFY],
                ['selectfirstitem', PROP_BOOLEAN_NOTIFY],
                ['selectionlimit', PROP_NUMBER_NOTIFY],
                ['shortcutkey', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['subheading', PROP_BOOLEAN],
                ['title', PROP_STRING]
            ]
        )
    );
};

