import { PROP_STRING_NOTIFY, register } from '../base/framework/widget-props';

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
