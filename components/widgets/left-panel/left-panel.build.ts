import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'aside';

register('wm-left-panel', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmLeftPanel partialContainer data-role="page-left-panel" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};