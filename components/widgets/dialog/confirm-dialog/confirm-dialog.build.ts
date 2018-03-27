import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-confirmdialog', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmConfirmDialog ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
