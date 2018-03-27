import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'p';

register('wm-message', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmMessage ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};