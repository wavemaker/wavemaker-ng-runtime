import { IDGenerator } from '@wm/core';
import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

const idGen = new IDGenerator('wm_layout');

register('wm-layout', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            return `<${tagName} wmPage #${counter}="wmPage" data-role="pageContainer" [attr.aria-label]="${counter}.hint || 'Main page content'" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
