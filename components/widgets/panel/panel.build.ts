import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-panel', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPanel partialContainer ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};