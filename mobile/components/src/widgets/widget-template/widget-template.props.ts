import { PROP_BOOLEAN, PROP_NUMBER, register } from '@wm/components';

export const registerProps = () => {
    register(
        'wm-widget-template',
        new Map(
            [
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
