import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-panel',
        new Map(
            [
                ['actions', PROP_STRING],
                ['badgetype', PROP_STRING],
                ['badgevalue', PROP_STRING],
                ['class', PROP_STRING],
                ['closable', PROP_BOOLEAN],
                ['collapsible', PROP_BOOLEAN],
                ['conditionalclass', PROP_STRING],
                ['datafield', PROP_STRING],
                ['enablefullscreen', PROP_BOOLEAN],
                ['expanded', PROP_BOOLEAN_NOTIFY],
                ['fullscreen', PROP_BOOLEAN],
                ['helpClass', PROP_STRING],
                ['helptext', PROP_STRING],
                ['iconclass', PROP_STRING_NOTIFY],
                ['iconheight', PROP_STRING_NOTIFY],
                ['iconmargin', PROP_STRING_NOTIFY],
                ['iconurl', PROP_STRING_NOTIFY],
                ['itemaction', PROP_STRING],
                ['itemchildren', PROP_STRING],
                ['itemicon', PROP_STRING],
                ['itemlabel', PROP_STRING],
                ['itemlink', PROP_STRING],
                ['name', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['showindevice', Object.assign({displayType: 'inline-block', value: 'all'}, PROP_STRING)],
                ['subheading', PROP_STRING],
                ['title', PROP_STRING],
                ['userrole', PROP_STRING]
            ]
        )
    );
};
