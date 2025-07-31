import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'footer';
const idGen = new IDGenerator('wm_footer');

register('wm-footer', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid()
            return `<${tagName} wmFooter #${counter}="wmFooter" show.bind="Variables.showLayout.dataSet.footer" partialContainer data-role="page-footer" role="contentinfo" [attr.aria-label]="${counter}.arialabel || 'Page footer'" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
