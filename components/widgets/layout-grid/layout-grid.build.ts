import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-layoutgrid', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmLayoutGrid ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};