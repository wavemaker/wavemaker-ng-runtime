import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-layoutgrid', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLayoutGrid ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};