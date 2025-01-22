import {PROP_STRING, register} from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-ds-widget-container',
        new Map(
            [
                ['name', PROP_STRING],
                ['class', PROP_STRING]
            ]
        )
    );
};
