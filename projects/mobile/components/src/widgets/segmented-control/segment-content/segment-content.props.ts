import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components';

export const registerProps = () => {
    register(
        'wm-segment-content',
        new Map(
            [
                ['caption', {value: '', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['content', PROP_STRING],
                ['iconclass', {value: '', ...PROP_STRING}],
                ['loadmode', PROP_STRING],
                ['loaddelay', {value: 10, ...PROP_NUMBER}],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
