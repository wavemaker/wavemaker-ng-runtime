import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const dynamicTemplateTagName = 'div';
let counter = 1;


// For dynamic accordion panes/tab panes
register('wm-repeat-template', (): IBuildTaskDef => {
    return {
        requires: ['wm-accordion', 'wm-tabs'],
        pre: (attrs, shared, parentAccordion, parentTab) => {
            const widgetRef = (parentAccordion && parentAccordion.get('accordion_ref')) || (parentTab && parentTab.get('tabs_ref'));
            if (widgetRef) {
                return `<div *ngIf="!${widgetRef}.fieldDefs">{{${widgetRef}.nodatamessage}}</div>
                    <${dynamicTemplateTagName} wmRepeatTemplate  ${getAttrMarkup(attrs)} *ngFor="let item of ${widgetRef}.fieldDefs; let i = index;">
                        <ng-container [ngTemplateOutlet]="widgetRef${counter}" [ngTemplateOutletContext]="{item:item, index:i}"></ng-container>
                    </${dynamicTemplateTagName}>
                    <ng-template #widgetRef${counter++} let-item="item" let-index="index">`;
            }

        },
        post: () => `</ng-template>`
    };
});

export default () => {};
