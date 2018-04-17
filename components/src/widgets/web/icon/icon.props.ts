import { register, PROP_STRING, PROP_STRING_NOTIFY, PROP_BOOLEAN } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-icon',
        new Map(
            [
                ['animation', PROP_STRING],
                ['caption', PROP_STRING_NOTIFY],
                ['hint', PROP_STRING],
                ['iconclass', PROP_STRING_NOTIFY],
                ['iconposition', PROP_STRING_NOTIFY],
                ['iconsize', PROP_STRING_NOTIFY],
                ['iconurl', PROP_STRING],
                ['name', PROP_STRING],
                ['show', PROP_BOOLEAN]
            ]
        )
    );
};
