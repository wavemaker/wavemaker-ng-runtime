import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-panel',
        new Map(
            [
                ['actions', PROP_STRING],
                ['badgetype', {value: 'default', ...PROP_STRING}],
                ['badgevalue', PROP_STRING],
                ['class', PROP_STRING],
                ['closable', PROP_BOOLEAN],
                ['collapsible', PROP_BOOLEAN],
                ['conditionalclass', PROP_STRING],
                ['content', PROP_STRING_NOTIFY],
                ['datafield', PROP_STRING],
                ['enablefullscreen', PROP_BOOLEAN],
                ['expanded', {value: true, ...PROP_BOOLEAN_NOTIFY}],
                ['expandicon', PROP_STRING],
                ['collapseicon', PROP_STRING],
                ['fullscreen', PROP_BOOLEAN_NOTIFY],
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
                ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
                ['subheading', PROP_STRING],
                ['title', PROP_STRING],
                ['userrole', PROP_STRING]
            ]
        )
    );
};
