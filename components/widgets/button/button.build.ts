import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'button';

register('wm-button', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmButton role="input" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};