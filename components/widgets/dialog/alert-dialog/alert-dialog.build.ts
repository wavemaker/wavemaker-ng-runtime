import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-alertdialog', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmAlertDialog ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
