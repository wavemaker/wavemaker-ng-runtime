import { PROP_ANY, PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-container',
        new Map(
            [
                ['animation', PROP_STRING],
                ['class', PROP_STRING],
                ['conditionalclass', PROP_ANY],
                ['conditionalstyle', PROP_ANY],
                ['content', PROP_STRING],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['direction', PROP_STRING],
                ['alignment', PROP_STRING],
                ['gap', PROP_STRING],
                ['wrap', PROP_BOOLEAN],
                ['columngap', PROP_STRING]
            ]
        )
    );
};
