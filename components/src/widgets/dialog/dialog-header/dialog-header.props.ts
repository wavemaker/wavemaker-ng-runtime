import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-dialogheader',
        new Map(
            [
                ['caption', PROP_STRING],
                ['closable', {value: true, ...PROP_BOOLEAN}],
                ['dialogId', PROP_STRING],
                ['iconclass', PROP_STRING_NOTIFY],
                ['iconheight', PROP_STRING],
                ['iconmargin', PROP_STRING],
                ['iconwidth', PROP_STRING],
                ['subheading', PROP_STRING]
            ]
        )
    );
};
