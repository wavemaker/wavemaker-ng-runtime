import { PROP_BOOLEAN, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-page',
        new Map(
            [
                ['cache', {value: false, ...PROP_BOOLEAN}],
            ]
        )
    );
};
