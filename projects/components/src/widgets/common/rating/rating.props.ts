import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const ratingProps = new Map(
    [
        ['caption', PROP_STRING],
        ['class', PROP_STRING],
        ['datafield', PROP_STRING],
        ['dataset', PROP_ANY],
        ['datavalue', PROP_STRING],
        ['displayexpression', PROP_STRING],
        ['displayfield', PROP_STRING],
        ['hint', PROP_STRING],
        ['iconcolor', PROP_STRING],
        ['iconsize', PROP_STRING],
        ['maxvalue', {value: 5, ...PROP_NUMBER}],
        ['name', PROP_STRING],
        ['orderby', PROP_STRING],
        ['readonly', PROP_BOOLEAN],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showcaptions', {value: true, ...PROP_BOOLEAN}],
        ['tabindex', {value: 0, ...PROP_NUMBER}],
        ['usekeys', PROP_BOOLEAN]
    ]
);

export const registerProps = () => {
    register(
        'wm-rating',
        ratingProps
    );
};
