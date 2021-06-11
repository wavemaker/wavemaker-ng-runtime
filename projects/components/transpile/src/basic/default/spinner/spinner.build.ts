import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'div';
const idGen = new IDGenerator('wm_spinner');

register('wm-spinner', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            const ariaLabel = attrs.get('hint') || '';
            return `<${tagName} wmSpinner #${counter}="wmSpinner" role="alert" [attr.aria-label]="'${ariaLabel}' || ${counter}._ariaLabel" aria-live="assertive" aria-busy="true" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
