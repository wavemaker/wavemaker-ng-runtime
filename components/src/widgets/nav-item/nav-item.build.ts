import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'li';

register('wm-nav-item', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmNavItem ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};