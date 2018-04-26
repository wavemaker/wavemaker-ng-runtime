import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-iframe',
        new Map(
            [
                ['class', PROP_STRING],
                ['encodeurl', PROP_BOOLEAN_NOTIFY],
                ['height', {value: '150px', ...PROP_STRING}],
                ['iframesrc', PROP_STRING_NOTIFY],
                ['name', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['width', {value: '300px', ...PROP_STRING}]
            ]
        )
    );
};


