import { getFormMarkupAttr, IBuildTaskDef, register, getChildAttrs } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';

const tagName = 'ul';

register('wm-checkboxset', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCheckboxset ${getFormMarkupAttr(attrs)} ${getChildAttrs(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
