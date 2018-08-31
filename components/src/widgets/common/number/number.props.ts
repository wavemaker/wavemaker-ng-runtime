import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-number',
        new Map(
            [
                ['autofocus', PROP_BOOLEAN],
                ['class', PROP_STRING],
                ['datavalue', PROP_STRING],
                ['disabled', PROP_BOOLEAN],
                ['hint', PROP_STRING],
                ['minvalue', PROP_NUMBER],
                ['maxvalue', PROP_NUMBER],
                ['name', PROP_STRING],
                ['placeholder', {value: 'Enter number', ...PROP_STRING}],
                ['readonly', PROP_BOOLEAN],
                ['regexp', PROP_STRING],
                ['required', PROP_BOOLEAN],
                ['shortcutkey', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['step', PROP_NUMBER],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['updateon', PROP_STRING]
            ]
        )
    );
};
