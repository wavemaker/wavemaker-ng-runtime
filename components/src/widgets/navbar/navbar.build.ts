import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'nav';

register('wm-navbar', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmNavbar data-element-type="wmNavbar" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};