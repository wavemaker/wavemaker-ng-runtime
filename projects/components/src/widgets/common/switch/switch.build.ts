import { getNgModelAttr } from '@wm/core';
import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-switch', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSwitch ${getAttrMarkup(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
