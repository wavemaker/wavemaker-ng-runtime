import { register, PROP_STRING_NOTIFY } from '../base/framework/widget-props';

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