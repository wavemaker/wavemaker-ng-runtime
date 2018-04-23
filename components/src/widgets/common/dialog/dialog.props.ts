import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-dialog',
        new Map(
            [
                ['actionlink', PROP_STRING],
                ['actiontitle', PROP_STRING],
                ['class', PROP_STRING_NOTIFY],
                ['closable', {value: true, ...PROP_BOOLEAN_NOTIFY}],
                ['contentclass', PROP_STRING],
                ['iconclass', PROP_STRING_NOTIFY],
                ['iconheight', PROP_STRING],
                ['iconmargin', PROP_STRING],
                ['iconwidth', PROP_STRING],
                ['modal', PROP_BOOLEAN],
                ['name', PROP_STRING_NOTIFY],
                ['show', {value: false, ...PROP_BOOLEAN}],
                ['showheader', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', PROP_STRING],
                ['width', PROP_STRING_NOTIFY]
            ]
        )
    );
};
