import {PROP_ANY, PROP_BOOLEAN, PROP_STRING, register} from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-nav',
        new Map(
            [
                ['autoclose', {value: 'always', ...PROP_STRING}],
                ['autoopen', {value: 'never', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['dataset', PROP_ANY],
                ['iconposition', {value: 'left', ...PROP_STRING}],
                ['isactive', PROP_STRING],
                ['itemlabel', PROP_STRING],
                ['itemhint', PROP_STRING],
                ['itemlink', PROP_STRING],
                ['itemicon', PROP_STRING],
                ['itemclass', PROP_STRING],
                ['itemchildren', PROP_STRING],
                ['itemaction', PROP_STRING],
                ['itembadge', PROP_STRING],
                ['itemtarget', PROP_STRING],
                ['layout', PROP_STRING],
                ['name', PROP_STRING],
                ['orderby', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['showonhover', {value: false, ...PROP_BOOLEAN}],
                ['type', PROP_STRING],
                ['userrole', PROP_STRING]
            ]
        )
    );
};
