import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'section';

register('wm-prefab', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmPrefab data-role="perfab" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};