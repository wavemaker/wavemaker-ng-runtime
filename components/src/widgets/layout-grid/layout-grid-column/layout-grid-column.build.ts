import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-gridcolumn', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLayoutGridColumn ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};