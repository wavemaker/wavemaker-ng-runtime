import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'button';
const idGen = new IDGenerator('wm_button');

register('wm-button', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid()
            const ariaLabel = attrs.get('hint') || attrs.get('caption') || '';
            return `<${tagName} wmButton #${counter}="wmButton" [attr.aria-label]="'${ariaLabel}' || ${counter}._ariaLabel" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
