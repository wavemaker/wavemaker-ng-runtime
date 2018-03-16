import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'nav';

register('wm-navbar', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmNavbar data-element-type="wmNavbar" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};