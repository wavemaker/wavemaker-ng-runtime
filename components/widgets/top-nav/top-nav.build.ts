import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'section';

register('wm-top-nav', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTopNav partialContainer data-role="page-topnav" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
