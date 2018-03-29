import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-checkbox', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCheckbox role="input" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};