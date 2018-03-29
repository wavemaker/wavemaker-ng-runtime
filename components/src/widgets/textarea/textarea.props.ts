import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-textarea',
        new Map(
            [
                ['autofocus', PROP_BOOLEAN],
                ['class', PROP_STRING],
                ['datavalue', PROP_STRING],
                ['disabled', PROP_BOOLEAN],
                ['maxchars', PROP_NUMBER],
                ['name', PROP_STRING],
                ['placeholder', {value: 'Place your text', ...PROP_STRING}],
                ['readonly', PROP_BOOLEAN],
                ['required', PROP_BOOLEAN],
                ['shortcutkey', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['tabindex', PROP_NUMBER]
            ]
        )
    );
};
