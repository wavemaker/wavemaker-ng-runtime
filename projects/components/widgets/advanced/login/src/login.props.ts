import {PROP_ANY, PROP_STRING, register} from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-login',
        new Map(
            [
                ['errormessage', PROP_STRING],
                ['eventsource', PROP_ANY]
            ]
        )
    );
};
