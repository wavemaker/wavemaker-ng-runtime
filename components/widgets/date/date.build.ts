import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-date', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmDate role="input" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};