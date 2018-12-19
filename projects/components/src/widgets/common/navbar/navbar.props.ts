import { PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-navbar',
        new Map(
            [
                ['class', {value: '', ...PROP_STRING}],
                ['homelink', PROP_STRING],
                ['imgsrc', PROP_STRING],
                ['menuiconclass', {value: 'wi wi-more-vert', ...PROP_STRING}],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['title', PROP_STRING]
            ]
        )
    );
};
