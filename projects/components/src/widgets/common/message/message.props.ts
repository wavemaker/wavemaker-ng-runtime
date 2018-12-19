import { PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-message',
        new Map(
            [
                ['caption', {value: 'Message', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['hideclose', {value: false, ...PROP_BOOLEAN}],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['type', {value: 'success', ...PROP_STRING}],
            ]
        )
    );
};
