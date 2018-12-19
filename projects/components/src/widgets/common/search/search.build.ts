import { getNgModelAttr } from '@wm/core';

import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-search', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSearch ${getAttrMarkup(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
