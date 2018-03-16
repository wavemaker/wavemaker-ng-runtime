import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'aside';

register('wm-right-panel', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmRightPanel partialContainer data-role="page-right-panel" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
