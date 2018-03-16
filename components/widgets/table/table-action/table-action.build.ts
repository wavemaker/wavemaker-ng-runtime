import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-table-action', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmTableAction ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
