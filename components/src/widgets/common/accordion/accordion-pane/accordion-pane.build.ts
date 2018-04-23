import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-accordionpane', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmAccordionPane partialContainer wmNavigableElement="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
