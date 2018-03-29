import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-table-column-group', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTableColumnGroup ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
