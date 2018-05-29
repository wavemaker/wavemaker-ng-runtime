import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-anchor',
        new Map(
            [
                ['badgevalue', PROP_STRING],
                ['caption', {value: 'Link', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['conditionalclass', PROP_STRING],
                ['encodeurl', PROP_BOOLEAN],
                ['hint', PROP_STRING],
                ['hyperlink', PROP_STRING_NOTIFY],
                ['iconclass', PROP_STRING],
                ['iconheight', PROP_STRING],
                ['iconmargin', PROP_STRING],
                ['iconposition', PROP_STRING],
                ['iconurl', PROP_STRING],
                ['iconwidth', PROP_STRING],
                ['name', PROP_STRING],
                ['shortcutkey', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['target', {value: '_self', ...PROP_STRING}]
            ]
        )
    );
};
