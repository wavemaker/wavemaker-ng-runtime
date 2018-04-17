import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-confirmdialog',
        new Map(
            [
                ['canceltext', {value: 'CANCEL', ...PROP_STRING}],
                ['closable', {value: true, ...PROP_BOOLEAN_NOTIFY}],
                ['name', PROP_STRING_NOTIFY],
                ['iconclass', {value: 'wi wi-done', PROP_STRING}],
                ['keyboard', {value: true, ...PROP_BOOLEAN}],
                ['message', {value: 'I am confirm box!', ...PROP_STRING_NOTIFY}],
                ['modal', {value: false, ...PROP_BOOLEAN}],
                ['oktext', {value: 'OK', ...PROP_STRING}],
                ['title', {value: 'Confirm', ...PROP_STRING_NOTIFY}]
            ]
        )
    );
};
