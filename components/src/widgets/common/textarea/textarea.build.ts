import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-textarea', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTextarea ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};