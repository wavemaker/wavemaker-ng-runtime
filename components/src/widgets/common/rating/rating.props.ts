import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER, PROP_NUMBER_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../framework/widget-props';

export const ratingProps = new Map(
    [
        ['caption', PROP_STRING],
        ['class', PROP_STRING],
        ['datafield', PROP_STRING_NOTIFY],
        ['dataset', {notify: true}],
        ['datavalue', PROP_STRING_NOTIFY],
        ['displayexpression', PROP_STRING],
        ['displayfield', PROP_STRING_NOTIFY],
        ['hint', PROP_STRING],
        ['iconcolor', PROP_STRING],
        ['iconsize', PROP_STRING],
        ['maxvalue', {value: 5, ...PROP_NUMBER_NOTIFY}],
        ['name', PROP_STRING],
        ['orderby', PROP_STRING_NOTIFY],
        ['readonly', PROP_BOOLEAN_NOTIFY],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showcaptions', PROP_BOOLEAN],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['usekeys', PROP_BOOLEAN_NOTIFY]
    ]
);

export const registerProps = () => {
    register(
        'wm-rating',
        ratingProps
    );
};
