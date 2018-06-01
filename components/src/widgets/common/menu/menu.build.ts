import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';
import { IDGenerator } from '@wm/core';

const tagName = 'div';

const idGen = new IDGenerator('wm_menu_ref_');

register('wm-menu', (): IBuildTaskDef => {
    return {
        pre: attrs => {
            const counter = idGen.nextUid();
            return `<${tagName} wmMenu dropdown #${counter}="wmMenu" [autoClose]="${counter}.autoclose !== 'disabled'" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
