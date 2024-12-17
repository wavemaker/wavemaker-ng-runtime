import {getAttrMarkup, IBuildTaskDef, register} from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'div';
const idGen = new IDGenerator('wm_accordionpane');

register('wm-accordionpane', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            return `<${tagName} #${counter}="wmAccordionPane" wmAccordionPane partialContainer wm-navigable-element="true" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
