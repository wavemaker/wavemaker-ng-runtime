import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-container',
        new Map(
            [
                ['class', PROP_STRING],
                ['conditionalclass', PROP_STRING],
                ['content', PROP_STRING_NOTIFY],
                ['name', PROP_STRING],
                ['show', PROP_BOOLEAN]
            ]
        )
    );
};