import { PROP_ANY, PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-breadcrumb',
        new Map(
            [
                ['class', PROP_STRING],
                ['dataset', PROP_ANY],
                ['itemlabel', PROP_STRING],
                ['itemid', PROP_STRING],
                ['itemlink', PROP_STRING],
                ['itemicon', PROP_STRING],
                ['itemchildren', PROP_STRING],
                ['itemclass', PROP_STRING],
                ['itemtarget', PROP_STRING],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};