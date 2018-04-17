import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-accordion', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmAccordion ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
