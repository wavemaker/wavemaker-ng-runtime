import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-switch', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmSwitch ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
