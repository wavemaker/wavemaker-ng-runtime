import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-confirmdialog', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmConfirmDialog ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
