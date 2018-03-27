import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-table-column-group', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTableColumnGroup ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
