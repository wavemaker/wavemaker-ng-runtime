import { IDGenerator } from '@wm/core';
import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'form';
const idGen = new IDGenerator('wizard_step_id_');

register('wm-wizardstep', (): IBuildTaskDef => {
    return {
        pre: attrs => {
            const counter = idGen.nextUid();
            return `<${tagName} wmWizardStep #${counter}="wmWizardStep" ${getAttrMarkup(attrs)}>
                       <ng-template [ngIf]="${counter}.isInitialized">`;
        },
        post: () => `</ng-template></${tagName}>`
    };
});

export default () => {};
