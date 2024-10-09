import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'div';
const idGen = new IDGenerator('wm_progress_circle');

register('wm-progress-circle', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            return `<${tagName} wmProgressCircle #${counter}="wmProgressCircle" role="progressbar" [attr.aria-label]="${counter}.arialabel || 'circle-progress'" [attr.hint]="${counter}.hint" [attr.aria-valuetext]="${counter}.displayValue" [attr.aria-valuemin]="${counter}.minvalue" [attr.aria-valuemax]="${counter}.maxvalue" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});


export default () => {};
