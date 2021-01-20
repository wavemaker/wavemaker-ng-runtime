import { getAttrMarkup, setChildAttrs, clearChildAttrs, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-composite', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmComposite captionPosition role="group" ${setChildAttrs(attrs)} ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}${clearChildAttrs()}>`
    };
});

export default () => {};
