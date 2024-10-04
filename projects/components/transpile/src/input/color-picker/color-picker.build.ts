import {getAttrMarkup, getChildAttrs, IBuildTaskDef, register} from '@wm/transpiler';
import {getNgModelAttr} from '@wm/core';

const tagName = 'div';

register('wm-colorpicker', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmColorPicker ${getAttrMarkup(attrs)} ${getChildAttrs(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
