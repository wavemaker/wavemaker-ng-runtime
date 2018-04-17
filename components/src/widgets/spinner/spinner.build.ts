import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-spinner', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSpinner ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
