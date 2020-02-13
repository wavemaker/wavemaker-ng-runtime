import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-marquee',
        new Map(
            [
                ['class', PROP_STRING],
                ['direction', PROP_STRING],
                ['name', PROP_STRING],
                ['scrollamount', PROP_NUMBER],
                ['scrolldelay', PROP_NUMBER],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
