import {getNgModelAttr, IDGenerator} from '@wm/core';
import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';
const idGen = new IDGenerator('wm_switch');

register('wm-switch', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            return`<${tagName} wmSwitch #${counter}="wmSwitch" [attr.aria-label]="${counter}.hint || 'Switch button'" ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
