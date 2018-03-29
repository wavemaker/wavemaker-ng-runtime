import { PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-html',
        new Map(
            [
                ['content', PROP_STRING_NOTIFY]
            ]
        )
    );
};
