import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-linearlayout', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLinearLayout ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
