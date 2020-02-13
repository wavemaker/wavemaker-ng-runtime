import { PROP_BOOLEAN, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-carousel-template',
        new Map(
            [
                ['show', PROP_BOOLEAN]
            ]
        )
    );
};
