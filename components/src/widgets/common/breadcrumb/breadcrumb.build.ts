import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'ul';

register('wm-breadcrumb', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmBreadcrumb ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};