import { Attribute, Component, ContentChild, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { toBoolean } from '@wm/core';
import { registerProps } from './dialog.props';
import { BaseDialog } from '../base/base-dialog';
import { provideAsDialogRef, provideAsWidgetRef } from '../../../../utils/widget-utils';

const DIALOG_CLS = 'app-dialog modal-dialog';

const WIDGET_INFO = {widgetType: 'wm-dialog'};

registerProps();

@Component({
    selector: 'div[wmDialog]',
    templateUrl: './dialog.component.html',
    providers: [
        provideAsWidgetRef(DialogComponent),
        provideAsDialogRef(DialogComponent)
    ]
})
export class DialogComponent extends BaseDialog implements OnInit {

    @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
    @ContentChild(TemplateRef) dialogContent: TemplateRef<any>;

    constructor(
        inj: Injector,
        @Attribute('class') dialogClass: string,
        @Attribute('modal') modal: string | boolean,
        @Attribute('closable') closable: string | boolean,
    ) {
        if (modal === null || modal === undefined) {
            modal = true;
        }

        if (closable === null || closable === undefined) {
            closable = true;
        }
        super(
            inj,
            WIDGET_INFO,
            {
                class: `${DIALOG_CLS} ${dialogClass || ''}`,
                backdrop: toBoolean(modal) || 'static',
                keyboard: toBoolean(closable)
            }
        );
    }

    protected getTemplateRef(): TemplateRef<any> {
        return this.dialogTemplate;
    }

    protected processAttr(attrName: string, attrValue: string) {
        // ignore the class attribute.
        // Prevent the framework from setting the class on the host element.
        if (attrName === 'class') {
            return;
        }
        super.processAttr(attrName, attrValue);
    }

    ngOnInit() {
        super.ngOnInit();
        this.register();
    }
}
