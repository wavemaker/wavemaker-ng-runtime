import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';

const tagName = 'ul';

register('wm-chips', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmChips role="listbox" ${getAttrMarkup(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
