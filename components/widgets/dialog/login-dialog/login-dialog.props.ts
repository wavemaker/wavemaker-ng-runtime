import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-logindialog',
        new Map(
            [
                ['closable', {value: false, ...PROP_BOOLEAN_NOTIFY}],
                ['name', PROP_STRING_NOTIFY],
                ['iconclass', PROP_STRING],
                ['keyboard', {value: true, ...PROP_BOOLEAN}],
                ['modal', {value: true, ...PROP_BOOLEAN}],
                ['oktext', {value: 'OK', ...PROP_STRING}],
                ['showactions', {value: true, ...PROP_BOOLEAN}],
                ['showheader', {value: true, ...PROP_BOOLEAN}],
                ['title', PROP_STRING_NOTIFY],
            ]
        )
    );
};
