import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-table-row-action', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTableRowAction ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
