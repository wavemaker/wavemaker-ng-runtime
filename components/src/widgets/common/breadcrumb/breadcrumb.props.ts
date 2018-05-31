import { register, PROP_STRING, PROP_STRING_NOTIFY, PROP_BOOLEAN } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-breadcrumb',
        new Map(
            [
                ['class', PROP_STRING],
                // TODO: all nav related properties can be grouped.
                ['dataset', PROP_STRING_NOTIFY],
                ['itemlabel', PROP_STRING_NOTIFY],
                ['itemid', PROP_STRING_NOTIFY],
                ['itemlink', PROP_STRING_NOTIFY],
                ['itemicon', PROP_STRING_NOTIFY],
                ['itemchildren', PROP_STRING_NOTIFY],
                ['itemclass', PROP_STRING],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};