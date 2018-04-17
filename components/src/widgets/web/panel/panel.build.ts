import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-panel', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPanel partialContainer ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

register('wm-panel-footer', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPanelFooter ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};