import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-accordionpane', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmAccordionPane partialContainer wmNavigableElement="true" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
