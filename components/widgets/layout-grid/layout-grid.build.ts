import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-layoutgrid', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLayoutGrid ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};