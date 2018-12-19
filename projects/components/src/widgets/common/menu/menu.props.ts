import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-menu',
        new Map(
            [
                ['accessroles', {value: 'Everyone', ...PROP_STRING}],
                ['animateitems', PROP_STRING],
                ['autoclose', {value: 'always', ...PROP_STRING}],
                ['autoopen', {value: 'never', ...PROP_STRING}],
                ['caption', PROP_STRING],
                ['class', PROP_STRING],
                ['dataset', {value: 'Menu Item 1, Menu Item 2, Menu Item 3', ...PROP_ANY}],
                ['hint', {value: '', ...PROP_STRING}],
                ['iconclass', PROP_STRING],
                ['iconposition', {value: 'left', ...PROP_STRING}],
                ['itemaction', PROP_STRING],
                ['itemchildren', PROP_STRING],
                ['itemclass', PROP_STRING],
                ['itemicon', PROP_STRING],
                ['itemlabel', PROP_STRING],
                ['itemlink', PROP_STRING],
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
