import { PROP_STRING, PROP_BOOLEAN, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-page',
        new Map(
            [
                ['cache', {value: false, ...PROP_BOOLEAN}],
                ['refreshdataonattach', {value: true, ...PROP_BOOLEAN}],
                ['pagetitle', PROP_STRING]
            ]
        )
    );
};
