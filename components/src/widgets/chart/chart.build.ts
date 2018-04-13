import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-chart', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmChart class="app-chart" redrawable ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
