import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'li';

register('wm-nav-item', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmNavItem ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};