import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';


export const registerProps = () => {
    register(
        'wm-input-color',
        new Map([
            ['autocomplete', {value: true, ...PROP_BOOLEAN}],
            ['autofocus', PROP_BOOLEAN],
            ['class', PROP_STRING],
            ['datavalue', PROP_STRING],
            ['disabled', PROP_BOOLEAN],
            ['name', PROP_STRING],
            ['placeholder', {value: 'Enter text', ...PROP_STRING}],
            ['readonly', PROP_BOOLEAN],
            ['required', PROP_BOOLEAN],
            ['shortcutkey', PROP_STRING],
            ['show', PROP_BOOLEAN],
            ['tabindex', PROP_NUMBER],
            ['type', PROP_STRING],
            ['updateon', {value: 'blur', ...PROP_STRING}]
        ])
    );
};
