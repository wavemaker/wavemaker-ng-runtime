import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const dynamicTemplateTagName = 'div';
let counter = 1;


// For dynamic accordion panes/tab panes
register('wm-repeat-template', (): IBuildTaskDef => {
    return {
        requires: ['wm-accordion', 'wm-tabs', 'wm-wizard'],
        pre: (attrs, shared, parentAccordion, parentTab, parentWizard) => {
            const widgetRef = (parentAccordion && parentAccordion.get('accordion_ref')) || (parentTab && parentTab.get('tabs_ref')) || (parentWizard && parentWizard.get('wizard_ref'));
            if (widgetRef) {
                return `@if(${widgetRef}.fieldDefs && !${widgetRef}.fieldDefs.length){<div>{{${widgetRef}.nodatamessage}}</div>}
                    <${dynamicTemplateTagName} wmRepeatTemplate #repeatItemRef="repeatItemRef" ${getAttrMarkup(attrs)} *ngFor="let item of ${widgetRef}.fieldDefs; let i = index;">
                        <ng-container [ngTemplateOutlet]="widgetRef${counter}"
                            [ngTemplateOutletContext]="{item:item, index:i}"
                            [ngTemplateOutletInjector]="${widgetRef}.createCustomInjector('dynamic_pane_' + repeatItemRef.trackId, {item:item, index:i})"></ng-container>
                    </${dynamicTemplateTagName}>
                    <ng-template #widgetRef${counter++} let-item="item" let-index="index">`;
            }

        },
        post: () => `</ng-template>`
    };
});

export default () => {};
