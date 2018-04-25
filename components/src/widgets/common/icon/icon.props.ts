import { PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-icon',
        new Map(
            [
                ['caption', PROP_STRING],
                ['hint', PROP_STRING],
                ['iconclass', {value: 'wi wi-star-border', ...PROP_STRING}],
                ['iconposition', {value: 'left', ...PROP_STRING}],
                ['iconsize', PROP_STRING],
                ['iconurl', PROP_STRING],
                ['name', PROP_STRING],
                ['show', PROP_BOOLEAN]
            ]
        )
    );
};
