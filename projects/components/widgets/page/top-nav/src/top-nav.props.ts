import { PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-top-nav',
        new Map(
            [
                ['name', PROP_STRING],
                ['content', PROP_STRING],
                ['hint', {value: 'Second level navigation', ...PROP_STRING}]
            ]
        )
    );
};
