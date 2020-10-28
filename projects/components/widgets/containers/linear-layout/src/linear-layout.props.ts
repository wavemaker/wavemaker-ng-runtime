import { PROP_BOOLEAN, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-linearlayout',
        new Map(
            [
                ['class', PROP_STRING],
                ['direction', PROP_STRING],
                ['horizontalalign', PROP_STRING],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['spacing', PROP_STRING],
                ['verticalalign', PROP_STRING],
            ]
        )
    );
};
