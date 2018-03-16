import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-gridrow', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmLayoutGridRow ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};