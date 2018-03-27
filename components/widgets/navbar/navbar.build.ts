import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'nav';

register('wm-navbar', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmNavbar data-element-type="wmNavbar" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};