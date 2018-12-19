import { getNgModelAttr } from '@wm/core';
import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-slider', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSlider ${getAttrMarkup(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
