import { PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-form-group',
        new Map(
            [
                ['captionposition', PROP_STRING],
                ['name', PROP_STRING],
                ['required', PROP_BOOLEAN],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
