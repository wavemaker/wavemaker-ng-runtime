import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'a';

register('wm-anchor', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmAnchor role="link" data-identifier="anchor" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};