import { register, PROP_STRING, PROP_BOOLEAN, PROP_STRING_NOTIFY } from '../base/framework/widget-props';

export const registerProps = () => {
    register(
        'wm-container',
        new Map(
            [
                ['animation', PROP_STRING],
                ['content', PROP_STRING_NOTIFY],
                ['show', PROP_BOOLEAN]
            ]
        )
    );
};