import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-form-group',
        new Map(
            [
                ['captionposition', PROP_STRING_NOTIFY],
                ['name', PROP_STRING],
                ['required', PROP_BOOLEAN_NOTIFY],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
