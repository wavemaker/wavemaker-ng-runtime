import { PROP_BOOLEAN, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-wizardaction',
        new Map([
            ['class', PROP_STRING],
            ['name', PROP_STRING],
            ['show', {value: true, ...PROP_BOOLEAN}]
        ])
    );
};
