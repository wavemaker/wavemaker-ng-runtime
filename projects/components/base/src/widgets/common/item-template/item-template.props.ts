import { PROP_ANY, PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-item-template',
        new Map(
            [
                ['content', PROP_STRING]
            ]
        )
    );
};
