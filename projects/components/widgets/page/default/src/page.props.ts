import {PROP_BOOLEAN, PROP_STRING, register} from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-page',
        new Map(
            [
                ['cache', {value: false, ...PROP_BOOLEAN}],
                ['refreshdataonattach', {value: true, ...PROP_BOOLEAN}],
                ['pagetitle', PROP_STRING],
                ['hint', PROP_STRING],
                ['arialabel', PROP_STRING]
            ]
        )
    );
};
