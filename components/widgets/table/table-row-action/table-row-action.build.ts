import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-table-row-action', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmTableRowAction ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
