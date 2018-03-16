import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'li';

register('wm-nav-item', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmNavItem ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};