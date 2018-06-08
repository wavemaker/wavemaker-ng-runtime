import { PROP_BOOLEAN_NOTIFY, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-table-action',
        new Map(
            [
                ['accessroles', PROP_STRING],
                ['action', PROP_STRING],
                ['caption', PROP_STRING],
                ['class', PROP_STRING],
                ['disabled', {value: false, ...PROP_BOOLEAN_NOTIFY}],
                ['display-name', PROP_STRING_NOTIFY],
                ['hyperlink', PROP_STRING],
                ['icon', PROP_STRING],
                ['iconclass', PROP_STRING],
                ['key', PROP_STRING],
                ['position', {value: 'footer', ...PROP_STRING}],
                ['shortcutkey', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN_NOTIFY}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', PROP_STRING_NOTIFY],
                ['target', PROP_STRING],
                ['widget-type', {value: 'button', ...PROP_STRING}]
            ]
        )
    );
};
