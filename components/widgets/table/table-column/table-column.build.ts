import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-table-column', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTableColumn ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
