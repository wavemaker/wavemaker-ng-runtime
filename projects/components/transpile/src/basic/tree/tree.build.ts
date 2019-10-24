import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-tree', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTree redrawable ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
