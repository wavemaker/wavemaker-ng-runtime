import { PROP_ANY, PROP_BOOLEAN, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-icon',
        new Map(
            [
                ['animation', PROP_STRING],
                ['caption', PROP_STRING],
                ['class', PROP_STRING],
                ['conditionalclass', PROP_ANY],
                ['conditionalstyle', PROP_ANY],
                ['hint', PROP_STRING],
                ['iconclass', {value: 'wi wi-star-border', ...PROP_STRING}],
                ['iconposition', {value: 'left', ...PROP_STRING}],
                ['iconsize', PROP_STRING],
                ['iconurl', PROP_STRING],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
