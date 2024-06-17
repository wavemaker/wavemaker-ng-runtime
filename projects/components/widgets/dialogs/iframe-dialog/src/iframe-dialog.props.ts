import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-iframedialog',
        new Map(
            [
                ['animation', PROP_STRING],
                ['class', PROP_STRING],
                ['closable', {value: true, PROP_BOOLEAN}],
                ['encodeurl', {value: false, ...PROP_BOOLEAN}],
                ['height', {value: '400px', ...PROP_STRING}],
                ['iconclass', {value: 'wi wi-globe', PROP_STRING}],
                ['iconheight', PROP_STRING],
                ['iconmargin', PROP_STRING],
                ['iconurl', PROP_STRING],
                ['iconwidth', PROP_STRING],
                ['modal', {value: false, ...PROP_BOOLEAN}],
                ['name', PROP_STRING],
                ['oktext', {value: 'OK', ...PROP_STRING}],
                ['showactions', {value: true, ...PROP_BOOLEAN}],
                ['showheader', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['headinglevel', {value: 'h4', ...PROP_STRING}],
                ['title', {value: 'External Content', ...PROP_STRING}],
                ['url', {value: '//www.wavemaker.com', ...PROP_STRING}]
            ]
        )
    );
};
