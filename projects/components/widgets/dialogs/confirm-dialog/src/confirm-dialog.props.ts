import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-confirmdialog',
        new Map(
            [
                ['animation', PROP_STRING],
                ['canceltext', {value: 'CANCEL', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['closable', {value: true, PROP_BOOLEAN}],
                ['iconclass', {value: 'wm-sl-l sl-check', PROP_STRING}],
                ['iconheight', PROP_STRING],
                ['iconmargin', PROP_STRING],
                ['iconurl', PROP_STRING],
                ['iconwidth', PROP_STRING],
                ['message', {value: 'I am confirm box!', ...PROP_STRING}],
                ['modal', {value: false, ...PROP_BOOLEAN}],
                ['name', PROP_STRING],
                ['oktext', {value: 'OK', ...PROP_STRING}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', {value: 'Confirm', ...PROP_STRING}]
            ]
        )
    );
};
