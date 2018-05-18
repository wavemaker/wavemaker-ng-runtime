import { register, PROP_STRING, PROP_BOOLEAN } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-tile',
        new Map(
            [
                ['class', PROP_STRING],
                ['conditionalclass', PROP_STRING],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};