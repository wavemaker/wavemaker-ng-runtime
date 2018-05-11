import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';
import {IDGenerator} from '@wm/core';

const tagName = 'ul';
const idGen = new IDGenerator('wm_checkboxset_');

register('wm-checkboxset', (): IBuildTaskDef => {
    return {
        pre: attrs => {
            const counter = idGen.nextUid();
            return `<${tagName} wmCheckboxset #${counter}="wmCheckboxset" [ngModel]="${counter}._model_" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};