import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-logindialog', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmLoginDialog ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
