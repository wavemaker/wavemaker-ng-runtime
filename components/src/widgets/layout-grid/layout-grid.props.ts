import { register, PROP_STRING, PROP_BOOLEAN } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-layoutgrid',
        new Map(
            [
                ['class', PROP_STRING],
                ['name', PROP_STRING],
                ['show', PROP_BOOLEAN]
            ]
        )
    );
};
