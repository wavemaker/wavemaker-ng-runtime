import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-partialdialog',
        new Map(
            [
                ['animation', PROP_STRING],
                ['class', PROP_STRING],
                ['closable', {value: true, PROP_BOOLEAN}],
                ['content', PROP_STRING],
                ['iconclass', {value: 'wi wi-file', PROP_STRING}],
                ['iconheight', PROP_STRING],
                ['iconmargin', PROP_STRING],
                ['iconurl', PROP_STRING],
                ['iconwidth', PROP_STRING],
                ['modal', {value: false, ...PROP_BOOLEAN}],
                ['name', PROP_STRING],
                ['oktext', {value: 'OK', ...PROP_STRING}],
                ['showactions', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['headinglevel', {value: 'h4', ...PROP_STRING}],
                ['title', {value: 'Page Content', ...PROP_STRING}]
            ]
        )
    );
};
