import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-accordion',
        new Map(
            [
                ['class', PROP_STRING],
                ['closeothers', {value: true, ...PROP_BOOLEAN}],
                ['defaultpaneindex', {value: 0, ...PROP_NUMBER}],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['statehandler', {value: 'inherit', ...PROP_STRING}]
            ]
        )
    );
};
