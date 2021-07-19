import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'button';
const idGen = new IDGenerator('wm_camera');

register('wm-camera', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            return `<${tagName} type='button' wmCamera #${counter}="wmCamera" [attr.aria-label]="${counter}.hint || 'Camera'"  ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
