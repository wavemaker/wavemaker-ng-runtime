import { PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-page',
        new Map(
            [
                ['pagetitle', PROP_STRING]
            ]
        )
    );
};