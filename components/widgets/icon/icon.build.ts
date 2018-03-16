import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'span';

register('wm-icon', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmIcon ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};