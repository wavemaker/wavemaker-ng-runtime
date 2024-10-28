import {getNgModelAttr, IDGenerator} from '@wm/core';
import {getFormMarkupAttr, IBuildTaskDef, register} from '@wm/transpiler';

const tagName = 'div';
const idGen = new IDGenerator('wm_switch');

register('wm-switch', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            return `<${tagName} wmSwitch #${counter}="wmSwitch" role="group" [attr.aria-label]="${counter}.arialabel || 'Switch choose options'" ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
