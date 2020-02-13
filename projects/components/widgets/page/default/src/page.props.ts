import { PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-page',
        new Map(
            [
                ['pagetitle', PROP_STRING]
            ]
        )
    );
};
