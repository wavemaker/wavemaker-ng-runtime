import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-composite', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmComposite role="input" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};