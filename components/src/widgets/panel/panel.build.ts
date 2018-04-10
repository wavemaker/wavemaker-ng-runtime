import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';
/**
 * this method registers the panel template generation during the build task
 */
register('wm-panel', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPanel partialContainer ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

register('wm-panel-footer', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPanelFooter ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    }
});

export default () => {};