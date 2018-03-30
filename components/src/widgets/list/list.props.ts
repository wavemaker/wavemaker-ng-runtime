import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

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
                ['name', PROP_STRING],
                ['navigation', PROP_STRING_NOTIFY],
                ['shortcutkey', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['subheading', PROP_BOOLEAN],
                ['title', PROP_STRING]
            ]
        )
    );
};

