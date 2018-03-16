import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-panel', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmPanel partialContainer ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};