import { PROP_ANY, PROP_BOOLEAN, PROP_STRING, register } from '@wm/components';

export const registerProps = () => {
    register(
        'wm-mobile-tabbar',
        new Map(
            [
                ['class', PROP_STRING],
                ['dataset', PROP_ANY],
                ['itemicon', PROP_STRING],
                ['itemlabel', PROP_STRING],
                ['itemlink', PROP_STRING],
                ['morebuttoniconclass', {value: 'wi wi-more-horiz', ...PROP_STRING}],
                ['morebuttonlabel', {value: 'more', ...PROP_STRING}],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
