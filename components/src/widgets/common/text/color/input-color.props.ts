import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../../framework/widget-props';


export const registerProps = () => {
    register(
        'wm-input-color',
        new Map([
            ['autocomplete', {value: true, ...PROP_BOOLEAN}],
            ['autofocus', PROP_BOOLEAN],
            ['class', PROP_STRING],
            ['datavalue', PROP_STRING],
            ['disabled', PROP_BOOLEAN],
            ['hint', PROP_STRING],
            ['name', PROP_STRING],
            ['placeholder', {value: 'Enter text', ...PROP_STRING}],
            ['readonly', PROP_BOOLEAN],
            ['required', PROP_BOOLEAN],
            ['shortcutkey', PROP_STRING],
            ['show', {value: true, ...PROP_BOOLEAN}],
            ['tabindex', {value: 0, ...PROP_NUMBER}],
            ['type', PROP_STRING],
            ['updateon', {value: 'blur', ...PROP_STRING_NOTIFY}]
        ])
    );
};
