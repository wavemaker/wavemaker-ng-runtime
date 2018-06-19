import { PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-iframe',
        new Map(
            [
                ['class', PROP_STRING],
                ['encodeurl', PROP_BOOLEAN],
                ['height', {value: '150px', ...PROP_STRING}],
                ['iframesrc', PROP_STRING],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['width', {value: '300px', ...PROP_STRING}]
            ]
        )
    );
};


