import { getNgModelAttr } from '@wm/core';
import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'ul';

register('wm-radioset', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmRadioset role="radiogroup" ${getAttrMarkup(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
