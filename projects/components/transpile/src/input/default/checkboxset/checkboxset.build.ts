import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';

const tagName = 'ul';

register('wm-checkboxset', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCheckboxset ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@angular/forms',
            name: 'FormsModule',
            as: 'ngFormsModule'
        },{
            from: '@wm/components/input',
            name: 'InputModule'
        }]
    };
});

export default () => {};
