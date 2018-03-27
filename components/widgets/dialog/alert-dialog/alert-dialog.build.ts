import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-alertdialog', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmAlertDialog ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
