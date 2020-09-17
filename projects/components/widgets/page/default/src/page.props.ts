import { PROP_STRING, PROP_BOOLEAN, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-page',
        new Map(
            [
                ['reuse', {value: "no", PROP_STRING}],
                ['pagetitle', PROP_STRING]
            ]
        )
    );
};
