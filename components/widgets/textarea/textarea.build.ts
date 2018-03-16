import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'textarea';

register('wm-textarea', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmTextarea ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};