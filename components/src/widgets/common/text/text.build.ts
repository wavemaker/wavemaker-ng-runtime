import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';
import { IDGenerator, getUpdateOnTmpl } from '@wm/core';

const tagName = 'input';
const idGen = new IDGenerator('wm_text_');

register('wm-text', (): IBuildTaskDef => {
    return {
        pre: attrs => {
            const counter = idGen.nextUid();
            return `<${tagName} wmText #${counter}="wmText" [(ngModel)]="${counter}.datavalue" role="input" ${getAttrMarkup(attrs)}
                        [wmAutocomplete]="${counter}.autocomplete" ${getUpdateOnTmpl(attrs.get('updateon'), attrs.get('formControlName'))}>`;
        }
    };
});

export default () => {};
