import { getNgModelAttr } from '@wm/core';

import { getFormMarkupAttr,getChildAttrs , IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-number', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmNumber ${getFormMarkupAttr(attrs)} ${getChildAttrs(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
