import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-gridcolumn', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLayoutGridColumn ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};