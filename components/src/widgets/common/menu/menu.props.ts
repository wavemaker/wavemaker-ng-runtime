import { PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-menu',
        new Map(
            [
                ['accessroles', {value: 'Everyone', ...PROP_STRING_NOTIFY}],
                ['animateitems', PROP_STRING],
                ['autoclose', {value: 'always', ...PROP_STRING}],
                ['caption', PROP_STRING],
                ['dataset', PROP_STRING_NOTIFY],
                ['iconclass', PROP_STRING],
                ['iconname', PROP_STRING_NOTIFY],
                ['itemaction', PROP_STRING_NOTIFY],
                ['itembadge', PROP_STRING_NOTIFY],
                ['itemchildren', PROP_STRING_NOTIFY],
                ['itemicon', PROP_STRING_NOTIFY],
                ['itemlabel', PROP_STRING_NOTIFY],
                ['itemlink', PROP_STRING_NOTIFY],
                ['linktarget', PROP_STRING_NOTIFY],
                ['menuclass', PROP_STRING],
                ['menulayout', PROP_STRING],
                ['menuposition', PROP_STRING_NOTIFY],
                ['orderby', PROP_STRING],
                ['shortcutkey', PROP_STRING],
                ['tabindex', {value: 0, ...PROP_NUMBER}]
            ]
        )
    );
};
