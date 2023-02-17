import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'button';
const idGen = new IDGenerator('wm_button');

register('wm-button', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid()
            return `<${tagName} wmButton #${counter}="wmButton" [attr.aria-label]="${counter}.hint || ${counter}.caption" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
