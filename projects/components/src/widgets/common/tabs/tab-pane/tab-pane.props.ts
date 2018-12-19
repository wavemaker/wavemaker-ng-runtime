import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-tabpane',
        new Map(
            [
                ['badgevalue', PROP_STRING],
                ['badgetype', {value: 'default', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['content', PROP_STRING],
                ['disabled', PROP_BOOLEAN],
                ['heading', PROP_STRING],
                ['isdefaulttab', PROP_STRING],
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
