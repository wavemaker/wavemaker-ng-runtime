import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-tree',
        new Map(
            [
                ['class', PROP_STRING],
                ['dataset', {value: 'node1, node2, node3', ...PROP_ANY}],
                ['datavalue', PROP_STRING],
                ['levels', {value: 0, ...PROP_NUMBER}],
                ['name', PROP_STRING],
                ['nodeaction', PROP_STRING],
                ['nodechildren', PROP_STRING],
                ['nodeclick', {value: 'none', ...PROP_STRING}],
                ['nodeicon', PROP_STRING],
                ['nodeid', PROP_STRING],
                ['nodelabel', PROP_STRING],
                ['orderby', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['treeicons', PROP_STRING]
            ]
        )
    );
};
