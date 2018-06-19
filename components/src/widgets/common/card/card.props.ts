import { PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-card',
        new Map(
            [
                ['actions', PROP_STRING],
                ['class', PROP_STRING],
                ['iconclass', PROP_STRING],
                ['iconurl', PROP_STRING],
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
                ['subheading', PROP_STRING],
                ['title', PROP_STRING],
                ['userrole', PROP_STRING]
            ]
        )
    );
};
