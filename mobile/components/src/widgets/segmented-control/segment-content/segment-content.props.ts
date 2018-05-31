import { PROP_STRING, register } from '@wm/components';

export const registerProps = () => {
    register(
        'wm-segment-content',
        new Map(
            [
                ['caption', {value: '', ...PROP_STRING}],
                ['iconclass', {value: '', ...PROP_STRING}]
            ]
        )
    );
};
