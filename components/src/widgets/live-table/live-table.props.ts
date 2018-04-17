import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, register } from '../base/framework/widget-props';

export const registerProps = () => {
    register(
        'wm-livetable',
        new Map(
            [
                ['class', PROP_STRING],
                ['formlayout', PROP_STRING_NOTIFY],
                ['name', PROP_STRING],
                ['show', PROP_BOOLEAN]
            ]
        )
    );
};
