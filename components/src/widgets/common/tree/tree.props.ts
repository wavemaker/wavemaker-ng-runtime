import { PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, PROP_BOOLEAN, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-tree',
        new Map(
            [
                ['dataset', {value: 'node1, node2, node3', notify: true}],
                ['datavalue', PROP_STRING_NOTIFY],
                ['levels', {value: 0, ...PROP_NUMBER}],
                ['name', PROP_STRING],
                ['nodeaction', PROP_STRING],
                ['nodechildren', PROP_STRING_NOTIFY],
                ['nodeclick', {value: 'none', ...PROP_STRING}],
                ['nodeicon', PROP_STRING_NOTIFY],
                ['nodeid', PROP_STRING],
                ['nodelabel', PROP_STRING_NOTIFY],
                ['orderby', PROP_STRING_NOTIFY],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['treeicons', PROP_STRING_NOTIFY]
            ]
        )
    );
};
