import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'label';

register('wm-label', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmLabel ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};