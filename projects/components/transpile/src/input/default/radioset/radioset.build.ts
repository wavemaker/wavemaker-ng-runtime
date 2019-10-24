import { getNgModelAttr } from '@wm/core';
import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'ul';

register('wm-radioset', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmRadioset role="radiogroup" ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/input',
            name: 'InputModule'
        }]
    };
});

export default () => {};
