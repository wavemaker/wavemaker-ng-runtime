import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'li';

register('wm-nav-item', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmNavItem role="presentation" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};