import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-accordionpane',
        new Map(
            [
                ['badgetype', {value: 'default', ...PROP_STRING}],
                ['badgevalue', PROP_STRING],
                ['content', PROP_STRING_NOTIFY],
                ['iconclass', PROP_STRING],
                ['isdefaultpane', PROP_BOOLEAN],
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
