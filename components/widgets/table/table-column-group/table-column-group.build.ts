import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-table-column-group', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmTableColumnGroup ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
