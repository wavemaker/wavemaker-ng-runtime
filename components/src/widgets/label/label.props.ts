import { PROP_BOOLEAN, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-label',
        new Map(
            [
                ['animation', PROP_STRING],
                ['caption', {value: 'Label', ...PROP_STRING_NOTIFY}],
                ['class', PROP_STRING],
                ['conditionalclass', PROP_STRING],
                ['hint', PROP_STRING],
                ['name', PROP_STRING],
                ['required', PROP_BOOLEAN],
                ['show', PROP_BOOLEAN],
                ['showindevice', {displayType: 'inline-block', value: 'all', ...PROP_STRING}],
            ]
        )
    );
};
