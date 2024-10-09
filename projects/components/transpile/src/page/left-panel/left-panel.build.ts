import {getAttrMarkup, IBuildTaskDef, register} from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'aside';
const idGen = new IDGenerator('wm_left_panel');

register('wm-left-panel', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            return `<${tagName} wmLeftPanel #${counter}="wmLeftPanel" partialContainer data-role="page-left-panel" [attr.aria-label]="${counter}.arialabel || 'Left navigation panel'" wmSmoothscroll="${attrs.get('smoothscroll') || 'false'}" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
