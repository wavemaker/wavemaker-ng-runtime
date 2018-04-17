import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-checkbox', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCheckbox role="input" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};