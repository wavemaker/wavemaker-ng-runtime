import { PROP_STRING, register, PROP_STRING_NOTIFY, PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-radioset',
        new Map(
            [
                ['class', PROP_STRING],
                ['datafield', PROP_STRING_NOTIFY],
                ['dataset', PROP_STRING_NOTIFY],
                ['datavalue', PROP_STRING_NOTIFY],
                ['disabled', PROP_BOOLEAN],
                ['displayexpression', PROP_STRING_NOTIFY],
                ['displayfield', PROP_STRING_NOTIFY],
                ['itemclass', Object.assign({value: ''}, PROP_STRING)],
                ['layout', Object.assign({value: 'stacked'}, PROP_STRING)],
                ['name', PROP_STRING],
                ['orderby', PROP_STRING_NOTIFY],
                ['readonly', PROP_BOOLEAN],
                ['required', PROP_BOOLEAN],
                ['selectedvalue', PROP_STRING_NOTIFY],
                ['show', PROP_BOOLEAN],
                ['showindevice', Object.assign({displayType: 'inline-block', value: 'all'}, PROP_STRING)],
                ['usekeys', PROP_BOOLEAN_NOTIFY],
                ['tabindex', PROP_NUMBER],
                ['type', PROP_STRING]
            ]
        )
    );
};
