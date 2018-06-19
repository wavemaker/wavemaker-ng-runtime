import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-partialdialog',
        new Map(
            [
                ['class', PROP_STRING],
                ['closable', {value: true, PROP_BOOLEAN}],
                ['content', PROP_STRING],
                ['iconclass', {value: 'wi wi-file', PROP_STRING}],
                ['iconheight', PROP_STRING],
                ['iconmargin', PROP_STRING],
                ['iconwidth', PROP_STRING],
                ['modal', {value: false, ...PROP_BOOLEAN}],
                ['name', PROP_STRING],
                ['oktext', {value: 'OK', ...PROP_STRING}],
                ['showactions', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', {value: 'Page Content', ...PROP_STRING}]
            ]
        )
    );
};
