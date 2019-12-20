import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';

const tagName = 'wm-textarea';

register('wm-textarea', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
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
