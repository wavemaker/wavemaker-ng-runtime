import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-partialdialog',
        new Map(
            [
                ['class', PROP_STRING],
                ['closable', {value: true, PROP_BOOLEAN}],
                ['content', PROP_STRING_NOTIFY],
                ['iconclass', {value: 'wi wi-warning', PROP_STRING}],
                ['iconheight', PROP_STRING],
                ['iconmargin', PROP_STRING],
                ['iconwidth', PROP_STRING],
                ['modal', {value: false, ...PROP_BOOLEAN}],
                ['name', PROP_STRING],
                ['oktext', {value: 'OK', ...PROP_STRING}],
                ['showactions', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', PROP_NUMBER],
                ['title', {value: 'Page Content', ...PROP_STRING}]
            ]
        )
    );
};
