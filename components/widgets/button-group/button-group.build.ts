import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-buttongroup', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmButtonGroup role="input" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};