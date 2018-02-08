import { register, PROP_STRING, PROP_STRING_NOTIFY, PROP_BOOLEAN } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-nav',
        new Map(
            [
                ['class', PROP_STRING],
                ['layout', PROP_STRING_NOTIFY],
                ['name', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['type', PROP_STRING_NOTIFY]
            ]
        )
    );
};