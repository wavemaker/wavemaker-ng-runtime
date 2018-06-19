import { PROP_ANY, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const switchProps = new Map(
    [
        ['class', PROP_STRING],
        ['compareby', PROP_STRING],
        ['datafield', PROP_STRING],
        ['dataset', {value: 'yes, no, maybe', ...PROP_ANY}],
        ['datavalue', PROP_STRING],
        ['displayfield', PROP_STRING],
        ['iconclass', PROP_STRING],
        ['orderby', PROP_STRING],
        ['tabindex', {value: 0, ...PROP_NUMBER}]
    ]
);


export const registerProps = () => {
    register(
        'wm-switch',
        switchProps
    );
};
