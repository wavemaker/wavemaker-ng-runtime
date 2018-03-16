import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-currency', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmCurrency ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};