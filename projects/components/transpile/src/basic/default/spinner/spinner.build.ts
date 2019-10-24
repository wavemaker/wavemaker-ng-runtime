import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-spinner', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSpinner role="loading" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
