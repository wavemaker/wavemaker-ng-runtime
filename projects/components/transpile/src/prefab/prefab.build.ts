import { getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'section';

register('wm-prefab', () => {
    return {
        pre: attrs => `<${tagName} wmPrefab redrawable data-role="perfab" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
