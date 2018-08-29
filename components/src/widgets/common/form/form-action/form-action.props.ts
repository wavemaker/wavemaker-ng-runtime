import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-form-action',
        new Map(
            [
                ['accessroles', PROP_STRING],
                ['action', PROP_STRING],
                ['class', PROP_STRING],
                ['binding', PROP_STRING],
                ['disabled', PROP_BOOLEAN],
                ['display-name', PROP_STRING],
                ['hyperlink', PROP_STRING],
                ['iconclass', PROP_STRING],
                ['iconname', PROP_STRING],
                ['key', PROP_STRING],
                ['position', {value: 'footer', ...PROP_STRING}],
                ['shortcutkey', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['target', PROP_STRING],
                ['title', PROP_STRING],
                ['type', {value: 'button', ...PROP_STRING}],
                ['update-mode', {value: true, ...PROP_BOOLEAN}],
                ['widget-type', {value: 'button', ...PROP_STRING}]
            ]
        )
    );
};
