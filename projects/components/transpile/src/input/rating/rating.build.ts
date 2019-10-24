import { getNgModelAttr } from '@wm/core';
import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-rating', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmRating ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/input/rating',
            name: 'RatingModule'
        }]
    };
});

export default () => {};
