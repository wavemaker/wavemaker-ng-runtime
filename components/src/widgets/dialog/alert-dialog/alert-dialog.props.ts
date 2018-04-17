import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../base/framework/widget-props';

export const registerProps = () => {
    register(
        'wm-alertdialog',
        new Map(
            [
                ['alerttype', {value: 'error', ...PROP_STRING}],
                ['closable', {value: true, ...PROP_BOOLEAN_NOTIFY}],
                ['iconclass', {value: 'wi wi-warning', PROP_STRING}],
                ['keyboard', {value: true, ...PROP_BOOLEAN}],
                ['message', {value: 'Am an alert box!', ...PROP_STRING_NOTIFY}],
                ['modal', {value: false, ...PROP_BOOLEAN}],
                ['name', PROP_STRING_NOTIFY],
                ['oktext', {value: 'OK', ...PROP_STRING}],
                ['title', {value: 'Alert', ...PROP_STRING_NOTIFY}]
            ]
        )
    );
};
