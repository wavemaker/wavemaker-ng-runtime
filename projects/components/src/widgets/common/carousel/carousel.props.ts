import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-carousel',
        new Map(
            [
                ['animation', {value: 'auto', ... PROP_STRING}],
                ['animationinterval', {value: 3, ...  PROP_NUMBER}],
                ['controls', {value: 'both', ... PROP_STRING}],
                ['dataset', PROP_ANY],
                ['nodatamessage', {value: 'No Data Found', ... PROP_STRING}],
                ['show', PROP_BOOLEAN]
            ]
        )
    );
};
