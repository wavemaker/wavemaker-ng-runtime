import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'textarea';

register('wm-textarea', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTextarea ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};