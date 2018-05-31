import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-tabpane',
        new Map(
            [
                ['badgevalue', PROP_STRING],
                ['badgetype', {value: 'default', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['content', PROP_STRING_NOTIFY],
                ['disabled', PROP_BOOLEAN],
                ['heading', PROP_STRING_NOTIFY],
                ['isdefaulttab', PROP_STRING],
                ['name', PROP_STRING],
                ['paneicon', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', {value: 'Tab Title', ...PROP_STRING}]
            ]
        )
    );
};