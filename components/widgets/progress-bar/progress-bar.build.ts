import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-progressbar', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmProgressBar ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
