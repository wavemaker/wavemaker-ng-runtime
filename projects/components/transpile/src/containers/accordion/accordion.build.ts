import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-accordion', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmAccordion role="tablist" aria-multiselectable="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
