import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-param', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmParam hidden ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
