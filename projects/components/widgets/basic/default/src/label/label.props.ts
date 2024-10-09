import {PROP_ANY, PROP_BOOLEAN, PROP_STRING, register} from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-label',
        new Map(
            [
                ['animation', PROP_STRING],
                ['caption', {value: 'Label', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['conditionalclass', PROP_ANY],
                ['conditionalstyle', PROP_ANY],
                ['type', PROP_STRING],
                ['notag', PROP_BOOLEAN],
                ['hint', PROP_STRING],
                ['arialabel', PROP_STRING],
                ['name', PROP_STRING],
                ['required', PROP_BOOLEAN],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
