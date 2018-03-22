import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-confirmdialog', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmConfirmDialog ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
