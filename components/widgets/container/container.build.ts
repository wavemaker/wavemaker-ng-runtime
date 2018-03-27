import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-container', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmContainer partialContainer ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};