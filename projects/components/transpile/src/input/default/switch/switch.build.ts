import { getNgModelAttr } from '@wm/core';
import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-switch', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSwitch ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/input',
            name: 'InputModule'
        }]
    };
});

export default () => {};
