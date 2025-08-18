import { WmComponentsModule } from "@wm/components/base";
import {
    Attribute,
    Component,
    Inject,
    Injector,
    OnInit,
    Optional,
    SkipSelf,
    TemplateRef,
    ViewChild
} from '@angular/core';

import { toBoolean } from '@wm/core';
import { IWidgetConfig, provideAsDialogRef, provideAsWidgetRef } from '@wm/components/base';
import { BaseDialog, DialogBodyDirective, DialogFooterDirective, DialogHeaderComponent } from '@wm/components/dialogs';

import { registerProps } from './alert-dialog.props';
import { ButtonComponent } from "@wm/components/input";

const DIALOG_CLS = 'app-dialog modal-dialog app-alert-dialog';

const WIDGET_INFO: IWidgetConfig = { widgetType: 'wm-alertdialog' };

@Component({
    standalone: true,
    imports: [WmComponentsModule, DialogBodyDirective, DialogFooterDirective, DialogHeaderComponent, ButtonComponent],
    selector: 'div[wmAlertDialog]',
    templateUrl: './alert-dialog.component.html',
    providers: [
        provideAsWidgetRef(AlertDialogComponent),
        provideAsDialogRef(AlertDialogComponent)
    ]
})
export class AlertDialogComponent extends BaseDialog implements OnInit {
    static initializeProps = registerProps();

    @ViewChild('dialogTemplate', { static: true }) dialogTemplate: TemplateRef<any>;

    constructor(
        inj: Injector,
        @Attribute('class') dialogClass: string,
        @Attribute('modal') modal: string | boolean,
        @Attribute('closable') closable: string | boolean,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
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
            },
            explicitContext
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
        this.invokeEventCallback('ok', { $event });
    }

    ngOnInit() {
        super.ngOnInit();
        this.register(this.viewParent);
    }
}
