import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';

const tagName = 'div';

register('wm-time', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTime ${getFormMarkupAttr(attrs)} role="input" ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
