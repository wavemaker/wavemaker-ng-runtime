import { PROP_STRING, register } from '../base/framework/widget-props';

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
