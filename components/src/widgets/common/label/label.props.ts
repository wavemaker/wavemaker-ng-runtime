import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-label',
        new Map(
            [
                ['caption', {value: 'Label', ...PROP_STRING_NOTIFY}],
                ['class', PROP_STRING],
                ['conditionalclass', PROP_STRING],
                ['hint', PROP_STRING],
                ['name', PROP_STRING],
                ['required', PROP_BOOLEAN],
                ['show', {value: true, ...PROP_BOOLEAN}]
            ]
        )
    );
};
