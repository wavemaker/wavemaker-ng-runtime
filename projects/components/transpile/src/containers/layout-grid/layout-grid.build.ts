import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-layoutgrid', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLayoutGrid role="grid" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
