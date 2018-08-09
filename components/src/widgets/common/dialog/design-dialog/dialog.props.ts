import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-dialog',
        new Map(
            [
                ['animation', PROP_STRING],
                ['class', PROP_STRING],
                ['closable', {value: true, PROP_BOOLEAN}],
                ['iconclass', {value: 'wi wi-file-text', PROP_STRING}],
                ['iconheight', PROP_STRING],
                ['iconmargin', PROP_STRING],
                ['iconwidth', PROP_STRING],
                ['modal', {value: true, ...PROP_BOOLEAN}],
                ['name', PROP_STRING],
                ['showheader', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', {value: 'Information', ...PROP_STRING}],
                ['eventsource', PROP_ANY]
            ]
        )
    );
};
