import { PROP_ANY, PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-container',
        new Map(
            [
                ['class', PROP_STRING],
                ['conditionalclass', PROP_ANY],
                ['content', PROP_STRING],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
