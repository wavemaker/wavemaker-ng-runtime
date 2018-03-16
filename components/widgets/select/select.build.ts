import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-select', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmSelect ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
