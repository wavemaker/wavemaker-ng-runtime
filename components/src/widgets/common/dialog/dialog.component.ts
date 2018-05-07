import { Attribute, Component, ContentChild, forwardRef, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { toBoolean } from '@wm/core';

import { DialogRef, WidgetRef } from '../../framework/types';
import { registerProps } from './dialog.props';
import { BaseDialog } from './base-dialog/base-dialog';

const DIALOG_CLS = 'app-dialog modal-dialog';

const WIDGET_INFO = {widgetType: 'wm-dialog'};

registerProps();

@Component({
    selector: 'div[wmDialog]',
    templateUrl: './dialog.component.html',
    providers: [
        {provide: DialogRef, useExisting: forwardRef(() => DialogComponent)},
        {provide: WidgetRef, useExisting: forwardRef(() => DialogComponent)}
    ]
})
export class DialogComponent extends BaseDialog implements OnInit {

    @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
    @ContentChild(TemplateRef) dialogContent: TemplateRef<any>;

    constructor(
        inj: Injector,
        @Attribute('class') dialogClass: string,
        @Attribute('modal') modal: string,
        @Attribute('closable') closable: string,
    ) {
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
