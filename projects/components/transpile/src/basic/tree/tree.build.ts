import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'ul';

register('wm-tree', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTree class="ztree" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

