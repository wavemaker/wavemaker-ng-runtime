import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-dialogactions', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmDialogActions data-identfier="actions" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
