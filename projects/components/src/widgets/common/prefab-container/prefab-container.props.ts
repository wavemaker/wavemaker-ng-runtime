import { PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-prefab-container',
        new Map(
            [
                ['class', PROP_STRING],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
            ]
        )
    );
};
