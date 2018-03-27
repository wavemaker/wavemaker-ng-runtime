import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-gridcolumn', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLayoutGridColumn ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};