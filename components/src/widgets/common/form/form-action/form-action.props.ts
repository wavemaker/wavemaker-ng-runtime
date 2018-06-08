import { PROP_BOOLEAN_NOTIFY, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-form-action',
        new Map(
            [
                ['accessroles', PROP_STRING],
                ['action', PROP_STRING],
                ['class', {'value': 'btn-secondary', ...PROP_STRING}],
                ['binding', PROP_STRING],
                ['disabled', PROP_BOOLEAN_NOTIFY],
                ['display-name', PROP_STRING_NOTIFY],
                ['iconclass', PROP_STRING],
                ['iconname', PROP_STRING],
                ['key', PROP_STRING],
                ['position', {value: 'footer', ...PROP_STRING}],
                ['shortcutkey', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN_NOTIFY}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', PROP_STRING_NOTIFY],
                ['type', {value: 'button', ...PROP_STRING}],
                ['updateMode', PROP_STRING]
            ]
        )
    );
};
