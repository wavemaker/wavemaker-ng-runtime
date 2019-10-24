import { PROP_ANY, PROP_BOOLEAN, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-label',
        new Map(
            [
                ['caption', {value: 'Label', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['conditionalclass', PROP_ANY],
                ['conditionalstyle', PROP_ANY],
                ['hint', PROP_STRING],
                ['name', PROP_STRING],
                ['required', PROP_BOOLEAN],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
