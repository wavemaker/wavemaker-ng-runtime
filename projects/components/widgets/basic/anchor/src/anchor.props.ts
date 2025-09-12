import {PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register} from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-anchor',
        new Map(
            [
                ['animation', PROP_STRING],
                ['badgevalue', PROP_STRING],
                ['caption', {value: 'Link', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['conditionalclass', PROP_ANY],
                ['conditionalstyle', PROP_ANY],
                ['encodeurl', PROP_BOOLEAN],
                ['hint', PROP_STRING],
                ['arialabel', PROP_STRING],
                ['hyperlink', {value: '', ...PROP_STRING}],
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
