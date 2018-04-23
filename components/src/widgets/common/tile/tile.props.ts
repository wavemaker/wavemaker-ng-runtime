import { register, PROP_STRING, PROP_BOOLEAN } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-tile',
        new Map(
            [
                ['show', PROP_BOOLEAN],
                ['animation', PROP_STRING]
            ]
        )
    );
};