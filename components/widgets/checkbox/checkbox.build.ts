import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-checkbox', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmCheckbox role="input" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};