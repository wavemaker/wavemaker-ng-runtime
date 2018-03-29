import { PROP_STRING, register } from '../../utils/widget-props';

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
