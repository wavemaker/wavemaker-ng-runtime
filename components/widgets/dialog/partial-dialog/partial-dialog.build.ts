import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-pagedialog', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmPartialDialog ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
