import {getAttrMarkup, IBuildTaskDef, register} from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'div';
const idGen = new IDGenerator('wm_html');

register('wm-html', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            const ariaLabel = attrs.get('hint') || '';
            return `<${tagName} wmHtml #${counter}="wmHtml" [attr.aria-label]="'${ariaLabel}' || ${counter}._ariaLabel" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
