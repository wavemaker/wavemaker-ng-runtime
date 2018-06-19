import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-currency', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCurrency ${getAttrMarkup(attrs)} role="input" ngModel>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};