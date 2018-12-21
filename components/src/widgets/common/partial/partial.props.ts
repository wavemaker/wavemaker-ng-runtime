import { PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-partial',
        new Map(
            [
                ['name', PROP_STRING]
            ]
        )
    );
};
