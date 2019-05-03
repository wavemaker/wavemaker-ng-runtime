import { Attribute, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { toBoolean } from '@wm/core';

import { registerProps } from './alert-dialog.props';
import { BaseDialog } from '../base/base-dialog';
import { provideAsDialogRef, provideAsWidgetRef } from '../../../../utils/widget-utils';
import { IWidgetConfig } from '../../../framework/types';

const DIALOG_CLS = 'app-dialog modal-dialog app-alert-dialog';

const WIDGET_INFO: IWidgetConfig = {widgetType: 'wm-alertdialog'};

@Component({
    selector: 'div[wmAlertDialog]',
    templateUrl: './alert-dialog.component.html',
    providers: [
        provideAsWidgetRef(AlertDialogComponent),
        provideAsDialogRef(AlertDialogComponent)
    ]
})
export class AlertDialogComponent extends BaseDialog implements OnInit {
    static initializeProps = registerProps();

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

        // setting the backdrop to 'static' will not close the dialog on backdrop click
        const backdrop: boolean | 'static' = toBoolean(modal) ? 'static' : true;

        super(
            inj,
            WIDGET_INFO,
            {
                class: `${DIALOG_CLS} ${dialogClass || ''}`,
                backdrop,
                keyboard: !toBoolean(modal)
            }
        );
    }

    protected getTemplateRef(): TemplateRef<any> {
        return this.dialogTemplate;
    }

    /**
     * Click event handler for the ok button
     * invokes on-ok event callback
     * @param {Event} $event
     */
    onOk($event: Event) {
        this.invokeEventCallback('ok', {$event});
    }

    ngOnInit() {
        super.ngOnInit();
        this.register();
    }
}
