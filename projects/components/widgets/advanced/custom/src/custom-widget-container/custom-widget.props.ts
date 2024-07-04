import { PROP_BOOLEAN, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-custom-widget',
        new Map(
            [
                ['class', PROP_STRING],
                ['hint', PROP_STRING],
                ['name', PROP_STRING],
                ['widgetname', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
