import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'aside';
const idGen = new IDGenerator('wm_right_panel');

register('wm-right-panel', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid()
            return `<${tagName} wmRightPanel #${counter}="wmRightPanel" partialContainer data-role="page-right-panel" role="complementary" [attr.aria-label]="${counter}.hint || 'Right navigation panel'" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});
export default () => {};
