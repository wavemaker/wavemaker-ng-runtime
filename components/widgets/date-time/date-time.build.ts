import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-datetime', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmDateTime ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};