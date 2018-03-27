import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-table-row-action', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTableRowAction ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
