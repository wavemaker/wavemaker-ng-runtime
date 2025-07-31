import {PROP_BOOLEAN, PROP_STRING, register} from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-top-nav',
        new Map(
            [
                ['name', PROP_STRING],
                ['content', PROP_STRING],
                ['hint', PROP_STRING],
                ['arialabel', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
