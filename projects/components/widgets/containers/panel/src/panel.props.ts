import { PROP_ANY, PROP_BOOLEAN, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-panel',
        new Map(
            [
                ['actions', {}],
                ['autoclose', PROP_STRING],
                ['badgetype', { value: 'default', ...PROP_STRING }],
                ['badgevalue', PROP_STRING],
                ['class', PROP_STRING],
                ['closable', PROP_BOOLEAN],
                ['collapsible', PROP_BOOLEAN],
                ['conditionalclass', PROP_ANY],
                ['conditionalstyle', PROP_ANY],
                ['content', PROP_STRING],
                ['datafield', PROP_STRING],
                ['enablefullscreen', PROP_BOOLEAN],
                ['expanded', { value: true, ...PROP_BOOLEAN }],
                ['fullscreen', PROP_BOOLEAN],
                ['helptext', PROP_STRING],
                ['iconclass', PROP_STRING],
                ['iconheight', PROP_STRING],
                ['iconmargin', PROP_STRING],
                ['iconurl', PROP_STRING],
                ['iconwidth', PROP_STRING],
                ['itemaction', PROP_STRING],
                ['itemchildren', PROP_STRING],
                ['itemicon', PROP_STRING],
                ['itemlabel', PROP_STRING],
                ['itemlink', PROP_STRING],
                ['name', PROP_STRING],
                ['show', { value: true, ...PROP_BOOLEAN }],
                ['subheading', PROP_STRING],
                ['title', PROP_STRING],
                ['userrole', PROP_STRING]
            ]
        )
    );
};
