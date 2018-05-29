import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-iframedialog',
        new Map(
            [
                ['class', PROP_STRING],
                ['closable', {value: true, PROP_BOOLEAN}],
                ['encodeurl', {value: false, ...PROP_BOOLEAN}],
                ['height', {value: '400px', ...PROP_STRING}],
                ['iconclass', {value: 'wi wi-globe', PROP_STRING}],
                ['iconheight', PROP_STRING],
                ['iconmargin', PROP_STRING],
                ['iconwidth', PROP_STRING],
                ['modal', {value: false, ...PROP_BOOLEAN}],
                ['name', PROP_STRING],
                ['oktext', {value: 'OK', ...PROP_STRING}],
                ['showactions', {value: true, ...PROP_BOOLEAN}],
                ['showheader', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', {value: 'External Content', ...PROP_STRING}],
                ['url', {value: '//www.wavemaker.com', ...PROP_STRING}]
            ]
        )
    );
};
