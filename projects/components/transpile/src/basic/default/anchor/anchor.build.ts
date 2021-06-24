import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'a';
const idGen = new IDGenerator('wm_anchor');

register('wm-anchor', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            return `<${tagName} wmAnchor #${counter}="wmAnchor" role="link" data-identifier="anchor" [attr.aria-label]="${counter}.hint || ${counter}.caption || 'Link'" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
