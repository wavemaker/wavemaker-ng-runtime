import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'footer';
const idGen = new IDGenerator('wm_footer');

register('wm-footer', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid()
            return `<${tagName} wmFooter #${counter}="wmFooter" partialContainer data-role="page-footer" role="contentinfo" [attr.aria-label]="${counter}.hint || 'Page footer'" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
