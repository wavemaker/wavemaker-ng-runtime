import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-html',
        new Map(
            [
                ['class', PROP_STRING],
                ['content', PROP_STRING_NOTIFY],
                ['hint', PROP_STRING],
                ['name', PROP_STRING],
                ['show', PROP_BOOLEAN]
            ]
        )
    );
};
