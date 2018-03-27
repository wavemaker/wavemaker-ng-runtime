import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-accordion', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmAccordion ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
