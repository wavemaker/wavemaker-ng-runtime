import { getNgModelAttr } from '@wm/core';

import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-number', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmNumber ${getAttrMarkup(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
