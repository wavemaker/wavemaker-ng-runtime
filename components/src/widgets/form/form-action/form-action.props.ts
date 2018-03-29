import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-form-action',
        new Map(
            [
                ['accessroles', PROP_STRING],
                ['action', PROP_STRING],
                ['class', {'value': 'btn-secondary', ...PROP_STRING}],
                ['binding', PROP_STRING],
                ['disabled', PROP_BOOLEAN],
                ['displayName', PROP_STRING],
                ['iconclass', PROP_STRING],
                ['iconname', PROP_STRING],
                ['iconname', PROP_STRING],
                ['key', PROP_STRING],
                ['position', PROP_STRING],
                ['shortcutkey', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['tabindex', PROP_NUMBER],
                ['title', PROP_STRING],
                ['type', PROP_STRING],
                ['updateMode', PROP_STRING]
            ]
        )
    );
};
