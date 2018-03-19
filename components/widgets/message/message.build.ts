import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'p';

register('wm-message', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmMessage ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};