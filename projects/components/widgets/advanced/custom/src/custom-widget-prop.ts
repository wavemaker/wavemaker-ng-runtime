import {PROP_STRING, register} from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-custom-widget-container',
        new Map(
            [
                ['name', PROP_STRING]
            ]
        )
    );
};
