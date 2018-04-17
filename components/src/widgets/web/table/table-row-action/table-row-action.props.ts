import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-table-row-action',
        new Map(
            [
                ['accessroles', PROP_STRING],
                ['action', PROP_STRING],
                ['caption', PROP_STRING],
                ['class ', {'value': 'btn-secondary', ...PROP_STRING}],
                ['disabled', PROP_BOOLEAN],
                ['displayName', PROP_STRING],
                ['iconclass', PROP_STRING],
                ['key', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['tabindex', PROP_NUMBER],
                ['title', PROP_STRING]
            ]
        )
    );
};
