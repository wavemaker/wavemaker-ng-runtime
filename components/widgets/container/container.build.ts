import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-container', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmContainer partialContainer ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};