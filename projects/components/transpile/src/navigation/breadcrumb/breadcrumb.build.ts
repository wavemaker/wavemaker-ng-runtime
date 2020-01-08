import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'ol';

register('wm-breadcrumb', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmBreadcrumb ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
