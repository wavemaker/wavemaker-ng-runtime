import { PROP_BOOLEAN, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-buttongroup',
        new Map(
            [
                ['show', PROP_BOOLEAN],
                ['vertical', PROP_BOOLEAN]
            ]
        )
    );
};
