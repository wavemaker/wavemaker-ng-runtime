import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'section';
const idGen = new IDGenerator('wm_top_nav');

register('wm-top-nav', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid()
            return `<${tagName} wmTopNav #${counter}="wmTopNav" partialContainer data-role="page-topnav" role="navigation" [attr.aria-label]="${counter}.hint || 'Second level navigation'" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
