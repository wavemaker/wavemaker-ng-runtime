import { PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-buttongroup',
        new Map(
            [
                ['class', PROP_STRING],
                ['name', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['vertical', PROP_BOOLEAN]
            ]
        )
    );
};
