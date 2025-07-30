import {PROP_BOOLEAN, PROP_STRING, register} from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-html',
        new Map(
            [
                ['class', PROP_STRING],
                ['content', PROP_STRING],
                ['hint', PROP_STRING],
                ['arialabel', PROP_STRING],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
