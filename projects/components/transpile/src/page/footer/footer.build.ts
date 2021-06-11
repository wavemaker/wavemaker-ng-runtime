import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'footer';
const idGen = new IDGenerator('wm_footer');

register('wm-footer', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid()
            const ariaLabel = attrs.get('hint') || '';
            return `<${tagName} wmFooter #${counter}="wmFooter" partialContainer data-role="page-footer" role="contentinfo" [attr.aria-label]="'${ariaLabel}' || ${counter}._ariaLabel" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
