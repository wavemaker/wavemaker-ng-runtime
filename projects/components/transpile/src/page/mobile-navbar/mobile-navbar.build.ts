import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'header';

register('wm-mobile-navbar', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmMobileNavbar ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
