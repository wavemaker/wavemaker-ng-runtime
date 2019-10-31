import { getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'section';

register('wm-prefab', () => {
    return {
        pre: attrs => `<${tagName} wmPrefab data-role="perfab" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/prefab',
            name: 'PrefabModule'
        }]
    };
});

export default () => {};
