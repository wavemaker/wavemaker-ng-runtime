import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'div';
const idGen = new IDGenerator('wm_panel');

register('wm-panel', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            return `<${tagName} wmPanel #${counter}="wmPanel" partialContainer [attr.aria-label]="${counter}.hint || 'Panel'" wm-navigable-element="true" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

register('wm-panel-footer', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPanelFooter ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
