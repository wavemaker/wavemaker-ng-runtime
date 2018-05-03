import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-message',
        new Map(
            [
                ['caption', {value: 'Message', ...PROP_STRING_NOTIFY}],
                ['class', PROP_STRING],
                ['hideclose', {value: false, ...PROP_BOOLEAN}],
                ['name', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['type', {value: 'success', ...PROP_STRING_NOTIFY}],
            ]
        )
    );
};
