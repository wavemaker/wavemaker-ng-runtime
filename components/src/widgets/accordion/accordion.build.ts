import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-accordion', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmAccordion ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
