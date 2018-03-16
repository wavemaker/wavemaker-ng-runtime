import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'footer';

register('wm-footer', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmFooter partialContainer data-role="page-footer" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};