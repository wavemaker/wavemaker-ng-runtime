import { PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-top-nav',
        new Map(
            [
                ['name', PROP_STRING],
                ['content', PROP_STRING]
            ]
        )
    );
};