import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'label';

register('wm-label', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLabel ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};