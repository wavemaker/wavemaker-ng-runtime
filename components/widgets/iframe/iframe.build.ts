import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-iframe', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmIframe ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};