import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'label';
const idGen = new IDGenerator('wm_label');

register('wm-label', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            const ariaLabel = attrs.get('hint') || '';
            return `<${tagName} wmLabel #${counter}="wmLabel" [attr.aria-label]="'${ariaLabel}' || ${counter}._ariaLabel" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
