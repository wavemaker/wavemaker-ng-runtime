import { PROP_NUMBER, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-router-outlet',
        new Map(
            [
                ['columnwidth', PROP_NUMBER]
            ]
        )
    );
};
