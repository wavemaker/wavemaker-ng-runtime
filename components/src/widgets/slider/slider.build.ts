import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-slider', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSlider ${getAttrMarkup(attrs)} role="input">`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
