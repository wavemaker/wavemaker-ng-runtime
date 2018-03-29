import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'aside';

register('wm-right-panel', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmRightPanel partialContainer data-role="page-right-panel" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
