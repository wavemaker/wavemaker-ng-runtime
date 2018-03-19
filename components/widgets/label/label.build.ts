import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'label';

register('wm-label', (): BuildTaskDef => {
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