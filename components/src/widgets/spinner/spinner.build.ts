import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-spinner', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSpinner ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
