import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-confirmdialog', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmConfirmDialog ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
