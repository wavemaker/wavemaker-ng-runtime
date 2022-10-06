import { PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-router-outlet',
        new Map(
            [
                ['columnwidth', PROP_NUMBER],
                ['name', PROP_STRING]
            ]
        )
    );
};
