import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';

const tagName = 'ul';

register('wm-checkboxset', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCheckboxset ${getAttrMarkup(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
