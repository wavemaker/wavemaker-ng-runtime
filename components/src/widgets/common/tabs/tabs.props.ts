import { PROP_BOOLEAN, PROP_NUMBER_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-tabs',
        new Map(
            [
                ['class', PROP_STRING],
                ['defaultpaneindex', {value: 0, ...PROP_NUMBER_NOTIFY}],
                ['justified', PROP_BOOLEAN],
                ['tabsposition', {value: 'top', ...PROP_STRING_NOTIFY}],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['transition', PROP_STRING]
            ]
        )
    );
};
