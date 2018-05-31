import { register, PROP_STRING, PROP_STRING_NOTIFY } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-header',
        new Map(
            [
                ['name', PROP_STRING],
                ['class', PROP_STRING],
                ['content', PROP_STRING_NOTIFY]
            ]
        )
    );
};