import { PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-login',
        new Map(
            [
                ['errormessage', PROP_STRING]
            ]
        )
    );
};
