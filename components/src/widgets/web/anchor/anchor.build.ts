import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'a';

register('wm-anchor', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmAnchor role="button" data-identifier="anchor" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};