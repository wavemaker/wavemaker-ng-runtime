import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-layoutgrid', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLayoutGrid ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};