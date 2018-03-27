import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-progressbar', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmProgressBar ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
