import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';

const tagName = 'div';

register('wm-colorpicker', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmColorPicker ${getAttrMarkup(attrs)} role="input" ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};