import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-page-content', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmPageContent ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
