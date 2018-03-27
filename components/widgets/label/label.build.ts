import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'label';

register('wm-label', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLabel ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};