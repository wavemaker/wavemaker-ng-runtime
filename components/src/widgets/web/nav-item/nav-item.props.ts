import { register, PROP_STRING, PROP_BOOLEAN } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-nav-item',
        new Map(
            [
                ['class', PROP_STRING],
                ['name', PROP_STRING],
                ['show', PROP_BOOLEAN]
            ]
        )
    );
};