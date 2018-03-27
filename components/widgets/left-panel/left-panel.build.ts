import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'aside';

register('wm-left-panel', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLeftPanel partialContainer data-role="page-left-panel" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};