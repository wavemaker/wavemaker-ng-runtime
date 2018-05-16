import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-mobile-tabbar', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmMobileTabbar ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
