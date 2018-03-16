import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-html', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmHtml ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
