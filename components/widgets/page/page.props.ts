import { register, PROP_STRING_NOTIFY } from '../../utils/widget-props';

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