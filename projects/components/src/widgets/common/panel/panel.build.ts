import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-panel', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPanel partialContainer aria-label="panel" wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

register('wm-panel-footer', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPanelFooter aria-label="panel footer" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
