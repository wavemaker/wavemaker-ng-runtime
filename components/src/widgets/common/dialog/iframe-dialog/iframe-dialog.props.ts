import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-iframedialog',
        new Map(
            [
                ['closable', {value: true, ...PROP_BOOLEAN_NOTIFY}],
                ['encodeurl', {value: false, ...PROP_BOOLEAN}],
                ['height', {value: '400', ...PROP_STRING_NOTIFY}],
                ['name', PROP_STRING_NOTIFY],
                ['iconclass', {value: 'wi wi-globe', PROP_STRING}],
                ['keyboard', {value: true, ...PROP_BOOLEAN}],
                ['modal', {value: false, ...PROP_BOOLEAN}],
                ['oktext', {value: 'OK', ...PROP_STRING}],
                ['showactions', {value: true, ...PROP_BOOLEAN}],
                ['showheader', {value: true, ...PROP_BOOLEAN}],
                ['title', {value: 'External Content', ...PROP_STRING_NOTIFY}],
                ['url', {value: 'https://www.bing.com', ...PROP_STRING}]
            ]
        )
    );
};
