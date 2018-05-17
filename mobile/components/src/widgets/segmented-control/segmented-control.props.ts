import { PROP_NUMBER, register } from '@wm/components';

export const registerProps = () => {
    register(
        'wm-segmented-control',
        new Map(
            [
                ['tabindex', {value: 0, ...PROP_NUMBER}]
            ]
        )
    );
};
