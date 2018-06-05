import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-menu',
        new Map(
            [
                ['accessroles', {value: 'Everyone', ...PROP_STRING}],
                ['animateitems', PROP_STRING],
                ['autoclose', {value: 'always', ...PROP_STRING}],
                ['caption', PROP_STRING],
                ['dataset', {value: 'Menu Item 1, Menu Item 2, Menu Item 3', ...PROP_STRING_NOTIFY}],
                ['hint', {value: '', ...PROP_STRING}],
                ['iconclass', PROP_STRING],
                ['itemaction', PROP_STRING_NOTIFY],
                ['itemchildren', PROP_STRING_NOTIFY],
                ['itemicon', PROP_STRING_NOTIFY],
                ['itemlabel', PROP_STRING_NOTIFY],
                ['itemlink', PROP_STRING_NOTIFY],
                ['linktarget', {value: '', ...PROP_STRING}],
                ['menuclass', PROP_STRING],
                ['menulayout', PROP_STRING],
                ['menuposition', PROP_STRING],
                ['name', PROP_STRING],
                ['orderby', PROP_STRING],
                ['shortcutkey', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['type', {value: 'menu', ...PROP_STRING}],
                ['userrole', PROP_STRING]
            ]
        )
    );
};
