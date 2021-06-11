import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'div';
const idGen = new IDGenerator('wm_richtexteditor');

register('wm-richtexteditor', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid()
            const ariaLabel = attrs.get('hint') || '';
            return `<${tagName} wmRichTextEditor #${counter}="wmRichTextEditor" role="textbox" [attr.aria-label]="'${ariaLabel}' || ${counter}._ariaLabel" ${getFormMarkupAttr(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
