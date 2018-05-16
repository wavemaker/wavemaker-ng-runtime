import { PROP_STRING, PROP_STRING_NOTIFY, register } from '@wm/components';

export const registerProps = () => {
    register(
        'wm-mobile-tabbar',
        new Map(
            [
                ['dataset', PROP_STRING_NOTIFY],
                ['itemicon', PROP_STRING],
                ['itemlabel', PROP_STRING],
                ['itemlink', PROP_STRING],
                ['morebuttoniconclass', {value: 'wi wi-more-horiz', ...PROP_STRING}],
                ['morebuttonlabel', {value: 'more', ...PROP_STRING}]
            ]
        )
    );
};
