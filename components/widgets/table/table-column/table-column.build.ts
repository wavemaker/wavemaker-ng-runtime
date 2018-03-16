import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-table-column', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmTableColumn ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
