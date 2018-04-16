import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-currency', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCurrency ${getAttrMarkup(attrs)} role="input">`,
        post: () => `</${tagName}>`
    };
});

export default () => {};