import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-card',
        new Map(
            [
                ['actions', PROP_STRING_NOTIFY],
                ['class', PROP_STRING],
                ['iconclass', PROP_STRING_NOTIFY],
                ['iconurl', PROP_STRING_NOTIFY],
                ['imageheight', {value: '200px', ...PROP_STRING}],
                ['itemaction', PROP_STRING],
                ['itemchildren', PROP_STRING],
                ['itemicon', PROP_STRING],
                ['itemlabel', PROP_STRING],
                ['itemlink', PROP_STRING],
                ['name', PROP_STRING],
                ['picturesource', PROP_STRING],
                ['picturetitle', {value: '', ...PROP_STRING}],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['subheading', PROP_STRING_NOTIFY],
                ['title', PROP_STRING_NOTIFY],
                ['userrole', PROP_STRING]
            ]
        )
    );
};
