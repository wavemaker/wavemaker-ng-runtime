import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-table-action',
        new Map(
            [
                ['accessroles', PROP_STRING],
                ['action', PROP_STRING],
                ['caption', PROP_STRING],
                ['class', PROP_STRING],
                ['conditionalclass', PROP_ANY],
                ['conditionalstyle', PROP_ANY],
                ['disabled', {value: false, ...PROP_BOOLEAN}],
                ['display-name', PROP_STRING],
                ['hyperlink', PROP_STRING],
                ['icon', PROP_STRING],
                ['iconclass', PROP_STRING],
                ['key', PROP_STRING],
                ['position', {value: 'footer', ...PROP_STRING}],
                ['shortcutkey', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', PROP_STRING],
                ['target', PROP_STRING],
                ['widget-type', {value: 'button', ...PROP_STRING}]
            ]
        )
    );
};
