import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-accordion', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmAccordion ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
