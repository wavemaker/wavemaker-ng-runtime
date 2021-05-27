import { PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-header',
        new Map(
            [
                ['name', PROP_STRING],
                ['class', PROP_STRING],
                ['content', PROP_STRING],
                ['hint', PROP_STRING]
            ]
        )
    );
};
