import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-logindialog', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLoginDialog ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
