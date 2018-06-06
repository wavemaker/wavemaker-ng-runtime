import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-breadcrumb',
        new Map(
            [
                ['class', PROP_STRING],
                ['dataset', {notify: true}],
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