import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-navbar',
        new Map(
            [
                ['class', {value: '', ...PROP_STRING}],
                ['imgsrc', PROP_STRING_NOTIFY],
                ['menuiconclass', {value: 'wi wi-more-vert', ...PROP_STRING}],
                ['name', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['title', PROP_STRING]
            ]
        )
    );
};
