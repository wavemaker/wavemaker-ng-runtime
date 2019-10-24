import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';

const tagName = 'div';

register('wm-currency', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCurrency ${getAttrMarkup(attrs)} role="input" ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/input',
            name: 'InputModule'
        },{
            from: '@wm/components/input/currency',
            name: 'CurrencyModule'
        }]
    };
});

export default () => {};
