import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';

const tagName = 'div';

register('wm-date', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmDate ${getAttrMarkup(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
