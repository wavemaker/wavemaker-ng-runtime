import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-carousel',
        new Map(
            [
                ['animation', {value: 'auto', ... PROP_STRING}],
                ['animationinterval', {value: 3, ...  PROP_NUMBER}],
                ['controls', {value: 'both', ... PROP_STRING}],
                ['dataset', PROP_ANY],
                ['name', PROP_STRING],
                ['nodatamessage', {value: 'No Data Found', ... PROP_STRING}],
                ['show', PROP_BOOLEAN]
            ]
        )
    );
};
