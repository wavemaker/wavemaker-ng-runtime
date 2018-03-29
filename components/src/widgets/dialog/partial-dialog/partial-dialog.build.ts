import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-pagedialog', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPartialDialog ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
