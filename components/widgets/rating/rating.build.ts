import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-rating', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmRating ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
