import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, register } from '../../utils/widget-props';

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
