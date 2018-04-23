import { register, PROP_STRING_NOTIFY } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-page',
        new Map(
            [
                ['pagetitle', PROP_STRING_NOTIFY]
            ]
        )
    );
};