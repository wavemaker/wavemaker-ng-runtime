import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-video', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmVideo ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
