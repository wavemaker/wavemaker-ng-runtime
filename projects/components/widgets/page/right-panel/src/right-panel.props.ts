import { PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-right-panel',
        new Map(
            [
                ['class', PROP_STRING],
                ['columnwidth', PROP_NUMBER],
                ['content', PROP_STRING],
                ['name', PROP_STRING],
                ['hint', PROP_STRING]
            ]
        )
    );
};
