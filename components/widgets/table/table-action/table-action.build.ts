import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-table-action', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTableAction ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
