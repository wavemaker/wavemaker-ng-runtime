import { getNgModelAttr } from '@wm/core';

import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-number', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmNumber ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
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
