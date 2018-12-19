import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-accordionpane', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmAccordionPane partialContainer wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
