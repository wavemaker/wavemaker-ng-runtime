import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';
import {IDGenerator} from '@wm/core';

const tagName = 'ul';
const idGen = new IDGenerator('wm_radioset_');

register('wm-radioset', (): IBuildTaskDef => {
    return {
        pre: attrs => {
            const counter = idGen.nextUid();
            return `<${tagName} wmRadioset role="radiogroup" #${counter}="wmRadioset" [ngModel]="${counter}._model_" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};