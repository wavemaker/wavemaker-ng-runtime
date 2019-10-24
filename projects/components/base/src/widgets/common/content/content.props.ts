import { PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-content',
        new Map(
            [
                ['name', PROP_STRING],
                ['class', PROP_STRING]
            ]
        )
    );
};
