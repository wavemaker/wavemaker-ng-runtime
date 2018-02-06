import { register, PROP_STRING, PROP_STRING_NOTIFY } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-iframe',
        new Map(
            [
                ['encodeurl', PROP_STRING_NOTIFY],
                ['height', Object.assign({value: '150px'}, PROP_STRING)],
                ['iframesrc', PROP_STRING_NOTIFY],
                ['showindevice', Object.assign({value: 'all'}, PROP_STRING)],
                ['width', Object.assign({value: '300px'}, PROP_STRING)]
            ]
        )
    );
};


