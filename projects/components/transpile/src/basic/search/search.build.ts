import { getNgModelAttr } from '@wm/core';
import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-search', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSearch ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/basic/search',
            name: 'SearchModule'
        }]
    };
});

export default () => {};
