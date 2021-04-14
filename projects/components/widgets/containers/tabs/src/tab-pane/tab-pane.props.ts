import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-tabpane',
        new Map(
            [
                ['active', PROP_BOOLEAN], // internal property
                ['badgevalue', PROP_STRING],
                ['badgetype', {value: 'default', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['content', PROP_STRING],
                ['disabled', PROP_BOOLEAN],
                ['dynamicPaneIndex', PROP_NUMBER], // internal property
                ['heading', PROP_STRING],
                ['isdefaulttab', PROP_STRING],
                ['isdynamic', PROP_BOOLEAN], // internal property
                ['name', PROP_STRING],
                ['paneicon', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['smoothscroll', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', {value: 'Tab Title', ...PROP_STRING}]
            ]
        )
    );
};
