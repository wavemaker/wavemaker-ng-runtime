import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'div';
const idGen = new IDGenerator('wm_richtexteditor');

register('wm-richtexteditor', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid()
            return `<${tagName} wmRichTextEditor #${counter}="wmRichTextEditor" role="textbox" [attr.aria-label]="${counter}.hint || 'Richtext editor'" ${getFormMarkupAttr(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
