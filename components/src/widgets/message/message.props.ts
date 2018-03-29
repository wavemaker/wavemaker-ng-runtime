import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-message',
        new Map(
            [
                ['animation', PROP_STRING],
                ['caption', {value: 'Message', ...PROP_STRING_NOTIFY}],
                ['dataset', PROP_STRING_NOTIFY],
                ['hideclose', {value: false, ...PROP_BOOLEAN}],
                ['type', PROP_STRING_NOTIFY],
            ]
        )
    );
};
