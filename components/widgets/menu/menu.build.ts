import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-menu', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmMenu ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};