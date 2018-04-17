import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'aside';

register('wm-right-panel', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmRightPanel partialContainer data-role="page-right-panel" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
