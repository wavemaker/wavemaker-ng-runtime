import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-logindialog', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLoginDialog ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
