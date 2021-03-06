import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'nav';

register('wm-navbar', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmNavbar data-element-type="wmNavbar" role="navigation" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
