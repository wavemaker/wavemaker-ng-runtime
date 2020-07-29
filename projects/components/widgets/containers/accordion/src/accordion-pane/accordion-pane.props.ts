import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-accordionpane',
        new Map(
            [
                ['badgetype', {value: 'default', ...PROP_STRING}],
                ['badgevalue', PROP_STRING],
                ['class', PROP_STRING],
                ['content', PROP_STRING],
                ['dynamicPaneIndex', PROP_NUMBER], // internal property
                ['expandpane', PROP_BOOLEAN], // internal property
                ['iconclass', PROP_STRING],
                ['isdefaultpane', PROP_BOOLEAN],
                ['isdynamic', PROP_STRING], // internal property
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['smoothscroll', {value: true, ...PROP_BOOLEAN}],
                ['subheading', PROP_STRING],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', {value: 'Title', ...PROP_STRING}]
            ]
        )
    );
};
