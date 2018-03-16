import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-slider', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmSlider ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
