import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-anchor',
        new Map(
            [
                ['animation', PROP_STRING],
                ['badgevalue', PROP_STRING_NOTIFY],
                ['caption', Object.assign({value: 'link'}, PROP_STRING_NOTIFY)],
                ['class', PROP_STRING],
                ['conditionalclass', PROP_STRING],
                ['encodeurl', PROP_BOOLEAN],
                ['hint', PROP_STRING],
                ['hyperlink', PROP_STRING_NOTIFY],
                ['iconclass', PROP_STRING_NOTIFY],
                ['iconheight', PROP_STRING_NOTIFY],
                ['iconmargin', PROP_STRING_NOTIFY],
                ['iconposition', PROP_STRING_NOTIFY],
                ['iconurl', PROP_STRING],
                ['iconwidth', PROP_STRING_NOTIFY],
                ['name', PROP_STRING],
                ['shortcutkey', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['showindevice', Object.assign({displayType: 'inline-block', value: 'all'}, PROP_STRING)],
                ['tabindex', PROP_NUMBER],
                ['target', PROP_STRING]
            ]
        )
    );
};
