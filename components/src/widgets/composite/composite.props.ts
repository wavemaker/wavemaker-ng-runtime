import { PROP_BOOLEAN_NOTIFY, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-composite',
        new Map(
            [
                ['captionposition', PROP_STRING_NOTIFY],
                ['required', PROP_BOOLEAN_NOTIFY]
            ]
        )
    );
};
