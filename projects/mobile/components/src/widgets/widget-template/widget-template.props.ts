import { PROP_BOOLEAN, PROP_STRING, register } from '@wm/components';

export const registerProps = () => {
    register(
        'wm-widget-template',
        new Map(
            [
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
