import { PROP_BOOLEAN, PROP_STRING, register } from '@wm/components';

export const registerProps = () => {
    register(
        'wm-segmented-control',
        new Map(
            [
                ['class', PROP_STRING],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
