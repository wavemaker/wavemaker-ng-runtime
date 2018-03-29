import { register, PROP_STRING, PROP_STRING_NOTIFY } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-iframe',
        new Map(
            [
                ['encodeurl', PROP_STRING_NOTIFY],
                ['height', {value: '150px', ...PROP_STRING}],
                ['iframesrc', PROP_STRING_NOTIFY],
                ['showindevice', {value: 'all', ...PROP_STRING}],
                ['width', {value: '300px', ...PROP_STRING}]
            ]
        )
    );
};


