import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER, PROP_STRING_NOTIFY, register } from '../base/framework/widget-props';

export const richTextProps = new Map(
    [
        ['datavalue', PROP_STRING_NOTIFY],
        ['height', PROP_STRING_NOTIFY],
        ['placeholder', PROP_STRING_NOTIFY],
        ['readonly', PROP_BOOLEAN_NOTIFY],
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
