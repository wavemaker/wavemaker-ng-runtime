import { getFormMarkupAttr, IBuildTaskDef, register, getChildAttrs } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';

const tagName = 'div';

register('wm-checkbox', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCheckbox ${getFormMarkupAttr(attrs)} ${getChildAttrs(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
