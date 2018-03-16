import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-search', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmSearch role="input" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
