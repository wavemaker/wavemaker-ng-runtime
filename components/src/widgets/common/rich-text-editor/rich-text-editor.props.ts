import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const richTextProps = new Map(
    [
        ['class', PROP_STRING],
        ['datavalue', PROP_STRING],
        ['height', PROP_STRING],
        ['placeholder', PROP_STRING],
        ['readonly', PROP_BOOLEAN],
        ['showpreview', {value: false, ...PROP_BOOLEAN}],
        ['tabindex', {value: 0, ...PROP_NUMBER}]
    ]
);

export const registerProps = () => {
    register(
        'wm-richtexteditor',
        richTextProps
    );
};
