import { register, PROP_STRING, PROP_BOOLEAN, PROP_STRING_NOTIFY, PROP_NUMBER } from '../../utils/widget-props';

export const switchProps = new Map(
    [
        ['compareby', PROP_STRING],
        ['datafield', PROP_STRING],
        ['dataset', PROP_STRING_NOTIFY],
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
