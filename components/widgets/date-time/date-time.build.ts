import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-datetime', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmDateTime ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};