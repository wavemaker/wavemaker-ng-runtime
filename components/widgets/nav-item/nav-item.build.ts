import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'li';

register('wm-nav-item', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmNavItem ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};