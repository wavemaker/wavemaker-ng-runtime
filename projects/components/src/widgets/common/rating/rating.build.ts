import { getNgModelAttr } from '@wm/core';
import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-rating', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmRating ${getAttrMarkup(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
