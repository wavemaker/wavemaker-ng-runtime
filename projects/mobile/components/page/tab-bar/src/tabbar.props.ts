import { PROP_ANY, PROP_BOOLEAN, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-mobile-tabbar',
        new Map(
            [
                ['class', PROP_STRING],
                ['dataset', PROP_ANY],
                ['itemicon', {value: 'icon', ...PROP_STRING}],
                ['itemlabel', {value: 'label', ...PROP_STRING}],
                ['itemlink', {value: 'label', ...PROP_STRING}],
                ['morebuttoniconclass', {value: 'wi wi-more-horiz', ...PROP_STRING}],
                ['morebuttonlabel', {value: 'more', ...PROP_STRING}],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
