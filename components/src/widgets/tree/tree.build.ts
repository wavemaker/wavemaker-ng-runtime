import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-tree', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTree redrawable ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
