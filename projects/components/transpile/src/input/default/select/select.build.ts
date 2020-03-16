import { getNgModelAttr } from '@wm/core';
import { getFormMarkupAttr, IBuildTaskDef, register, getChildAttrs } from '@wm/transpiler';

const tagName = 'wm-select';

register('wm-select', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} ${getFormMarkupAttr(attrs)} ${getChildAttrs(attrs)}  ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
