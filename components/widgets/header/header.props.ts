import { register, PROP_STRING, PROP_STRING_NOTIFY } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-header',
        new Map(
            [
                ['height', PROP_STRING],
                ['name', PROP_STRING],
                ['content', PROP_STRING_NOTIFY]
            ]
        )
    );
};