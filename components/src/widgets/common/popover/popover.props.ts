import { PROP_BOOLEAN, PROP_STRING, PROP_NUMBER, register, PROP_STRING_NOTIFY } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-popover',
        new Map(
            [
                ['badgevalue', PROP_STRING],
                ['caption', {value: 'Link', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['content', PROP_STRING_NOTIFY],
                ['contentanimation', PROP_STRING],
                ['contentsource', PROP_STRING],
                ['encodeurl', PROP_BOOLEAN],
                ['hint', PROP_STRING],
                ['hyperlink', PROP_STRING_NOTIFY],
                ['iconclass', PROP_STRING],
                ['iconheight', PROP_STRING],
                ['iconmargin', PROP_STRING],
                ['iconposition', PROP_STRING],
                ['iconurl', PROP_STRING],
                ['iconwidth', PROP_STRING],
                ['interaction', {value: 'click', ...PROP_STRING}],
                ['name', PROP_STRING],
                ['popoverarrow', {value: true, ...PROP_BOOLEAN}],
                ['popoverheight', PROP_STRING],
                ['popoverplacement', {value: 'bottom', ... PROP_STRING}],
                ['popoverwidth', PROP_STRING],
                ['shortcutkey', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', PROP_STRING]

            ]
        )
    );
};
