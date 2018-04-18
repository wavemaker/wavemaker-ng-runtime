import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-chart', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmChart class="app-chart" redrawable ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
