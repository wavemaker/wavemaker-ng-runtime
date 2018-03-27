import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-pagedialog', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPartialDialog ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
