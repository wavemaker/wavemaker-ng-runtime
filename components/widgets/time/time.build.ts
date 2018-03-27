import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-time', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTime ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
