import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-linearlayoutitem', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLinearLayoutItem ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
