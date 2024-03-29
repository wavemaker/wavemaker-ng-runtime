import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'div';
const idGen = new IDGenerator('wm_html');

register('wm-html', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            return `<${tagName} wmHtml #${counter}="wmHtml" [attr.aria-label]="${counter}.hint || 'HTML content'" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
