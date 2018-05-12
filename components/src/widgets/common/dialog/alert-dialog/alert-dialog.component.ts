import { Attribute, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { IWidgetConfig } from '@wm/components';
import { toBoolean } from '@wm/core';
import { registerProps } from './alert-dialog.props';
import { BaseDialog } from '../base/base-dialog';
import { provideAsDialogRef, provideAsWidgetRef } from '../../../../utils/widget-utils';

const DIALOG_CLS = 'app-dialog modal-dialog app-alert-dialog';

const WIDGET_INFO: IWidgetConfig = {widgetType: 'wm-alertdialog'};

registerProps();

@Component({
    selector: 'div[wmAlertDialog]',
    templateUrl: './alert-dialog.component.html',
    providers: [
        provideAsWidgetRef(AlertDialogComponent),
        provideAsDialogRef(AlertDialogComponent)
    ]
})
export class AlertDialogComponent extends BaseDialog implements OnInit {

    @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

    constructor(
        inj: Injector,
        @Attribute('class') dialogClass: string,
        @Attribute('modal') modal: string | boolean,
        @Attribute('closable') closable: string | boolean,
    ) {
        if (modal === null || modal === undefined) {
            modal = false;
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

    /**
     * Click event handler for the ok button
     * invokes on-ok event callback
     * @param {Event} $event
     */
    onOk($event: Event) {
        this.invokeEventCallback('ok', {$event});
        this.close();
    }

    ngOnInit() {
        super.ngOnInit();
        this.register();
    }
}