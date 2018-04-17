import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'aside';

register('wm-left-panel', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLeftPanel partialContainer data-role="page-left-panel" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};