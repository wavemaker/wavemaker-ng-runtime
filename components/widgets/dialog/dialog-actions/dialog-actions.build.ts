import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-dialogactions', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmDialogActions data-identfier="actions" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
