import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'section';

register('wm-prefab', () => {
    return {
        pre: attrs => `<${tagName} wmPrefab data-role="perfab" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};