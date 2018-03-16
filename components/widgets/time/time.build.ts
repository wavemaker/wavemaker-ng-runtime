import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-time', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmTime ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
