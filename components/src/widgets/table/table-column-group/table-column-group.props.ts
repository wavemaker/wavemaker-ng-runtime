import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../base/framework/widget-props';

export const registerProps = () => {
    register(
        'wm-table-column-group',
        new Map(
            [
                ['accessroles', PROP_STRING],
                ['backgroundcolor', PROP_STRING_NOTIFY],
                ['caption', PROP_BOOLEAN],
                ['colClass', PROP_BOOLEAN],
                ['name', PROP_STRING_NOTIFY],
                ['textalignment', PROP_STRING]
            ]
        )
    );
};
