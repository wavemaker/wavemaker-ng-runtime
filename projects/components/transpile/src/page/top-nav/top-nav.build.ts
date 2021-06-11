import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'section';
const idGen = new IDGenerator('wm_top_nav');

register('wm-top-nav', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid()
            const ariaLabel = attrs.get('hint') || '';
            return `<${tagName} wmTopNav #${counter}="wmTopNav" partialContainer data-role="page-topnav" role="navigation" [attr.aria-label]="'${ariaLabel}' || ${counter}._ariaLabel" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
