import {getAttrMarkup, IBuildTaskDef, register} from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'a';
const idGen = new IDGenerator('wm_anchor');

register('wm-anchor', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            return `<${tagName} wmAnchor #${counter}="wmAnchor" role="link" data-identifier="anchor" [attr.aria-label]="${counter}.arialabel || (${counter}.badgevalue ? ${counter}.caption + ' ' + ${counter}.badgevalue : ${counter}.caption) || null" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
