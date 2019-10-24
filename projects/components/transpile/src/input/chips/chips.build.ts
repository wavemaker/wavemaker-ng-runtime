import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';

const tagName = 'ul';

register('wm-chips', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmChips role="listbox" ${getAttrMarkup(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/input/chips',
            name: 'ChipsModule'
        },{
            from: '@wm/components/basic/search',
            name: 'SearchModule'
        }]
    };
});

export default () => {};
