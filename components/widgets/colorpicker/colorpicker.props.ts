import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-colorpicker',
        new Map(
            [
                ['class', PROP_STRING],
                ['datavalue', PROP_STRING],
                ['disabled', PROP_BOOLEAN],
                ['name', PROP_STRING],
                ['placeholder', Object.assign({value: 'Select Color'}, PROP_STRING)],
                ['readonly', PROP_BOOLEAN],
                ['required', PROP_BOOLEAN],
                ['shortcutkey', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['showindevice', Object.assign({displayType: 'inline-block', value: 'all'}, PROP_STRING)],
                ['tabindex', Object.assign({value: 0}, PROP_NUMBER)]
            ]
        )
    );
};
