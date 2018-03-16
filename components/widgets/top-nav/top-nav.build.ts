import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'section';

register('wm-top-nav', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmTopNav partialContainer data-role="page-topnav" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
