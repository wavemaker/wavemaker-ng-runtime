import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-button',
        new Map(
            [
                ['badgevalue', PROP_STRING],
                ['caption', PROP_STRING],
                ['class', {value: 'btn-default', ...PROP_STRING}],
                ['conditionalclass', PROP_STRING],
                ['disabled', PROP_BOOLEAN],
                ['hint', PROP_STRING],
                ['iconclass', PROP_STRING],
                ['iconheight', PROP_STRING],
                ['iconmargin', PROP_STRING],
                ['iconposition', PROP_STRING],
                ['iconurl', PROP_STRING],
                ['iconwidth', PROP_STRING],
                ['name', PROP_STRING],
                ['shortcutkey', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['tabindex', PROP_NUMBER],
                ['type', PROP_STRING]
            ]
        )
    );
};
