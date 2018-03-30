import { PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-tree',
        new Map(
            [
                ['dataset', PROP_STRING_NOTIFY],
                ['datavalue', PROP_STRING_NOTIFY],
                ['levels', {value: 0, ...PROP_NUMBER}],
                ['nodeaction', PROP_STRING],
                ['nodechildren', PROP_STRING_NOTIFY],
                ['nodeclick', {value: 'none', ...PROP_STRING}],
                ['nodeicon', PROP_STRING_NOTIFY],
                ['nodeid', PROP_STRING],
                ['nodelabel', PROP_STRING_NOTIFY],
                ['orderby', PROP_STRING_NOTIFY],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['treeicons', PROP_STRING_NOTIFY]
            ]
        )
    );
};
