import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-currency', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCurrency ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};