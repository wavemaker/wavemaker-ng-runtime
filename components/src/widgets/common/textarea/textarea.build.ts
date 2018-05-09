import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';
import { getUpdateOnTmpl, IDGenerator } from '@wm/core';

const tagName = 'textarea';
const idGen = new IDGenerator('wm_textarea_');

register('wm-textarea', (): IBuildTaskDef => {
    return {
        pre: attrs => {
            const counter = idGen.nextUid();
            return `<${tagName} wmTextarea #${counter}="wmTextarea" [(ngModel)]="${counter}.datavalue" role="input"
                        ${getUpdateOnTmpl(attrs.get('updateon'), attrs.get('formControlName'))} ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};